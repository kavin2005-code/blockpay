import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BlockPay", function () {
  async function deployBlockPayFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const BlockPay = await ethers.getContractFactory("BlockPay");
    const blockPay = await BlockPay.deploy();
    await blockPay.waitForDeployment();
    return { blockPay, owner, alice, bob };
  }

  it("should create a wallet", async function () {
    const { blockPay, alice } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice_id");
    const wallet = await blockPay.getWalletInfo(alice.address);
    expect(wallet.isActive).to.equal(true);
  });

  it("should deposit funds", async function () {
    const { blockPay, alice } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice_id");
    await blockPay.connect(alice).depositFunds({ value: ethers.parseEther("1.0") });
    const balance = await blockPay.getWalletBalance(alice.address);
    expect(balance).to.equal(ethers.parseEther("1.0"));
  });

  it("should transfer funds between wallets", async function () {
    const { blockPay, alice, bob } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice");
    await blockPay.connect(bob).createWallet("bob");
    await blockPay.connect(alice).depositFunds({ value: ethers.parseEther("2.0") });
    await blockPay.connect(alice).transferFunds(bob.address, ethers.parseEther("1.0"), "");
    const bobBalance = await blockPay.getWalletBalance(bob.address);
    expect(bobBalance).to.be.gt(0n);
  });

  it("should reject self-transfer", async function () {
    const { blockPay, alice } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice");
    await blockPay.connect(alice).depositFunds({ value: ethers.parseEther("1.0") });
    await expect(
      blockPay.connect(alice).transferFunds(alice.address, ethers.parseEther("0.5"), "")
    ).to.be.revertedWith("BlockPay: Cannot transfer to yourself");
  });

  it("should reject insufficient balance", async function () {
    const { blockPay, alice, bob } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice");
    await blockPay.connect(bob).createWallet("bob");
    await blockPay.connect(alice).depositFunds({ value: ethers.parseEther("1.0") });
    await expect(
      blockPay.connect(alice).transferFunds(bob.address, ethers.parseEther("99.0"), "")
    ).to.be.revertedWith("BlockPay: Insufficient balance");
  });

  it("should pay a bill", async function () {
    const { blockPay, alice } = await loadFixture(deployBlockPayFixture);
    await blockPay.connect(alice).createWallet("alice