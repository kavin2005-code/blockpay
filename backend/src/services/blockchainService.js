const { ethers } = require("ethers");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.adminWallet = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.abi = null;
    this._initialize();
  }

  _initialize() {
    try {
      // Load ABI
      const abiPath = path.join(__dirname, "../config/BlockPayABI.json");
      this.abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

      // Setup provider
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup admin signer (for fee collection, operator functions)
      this.adminWallet = new ethers.Wallet(
        process.env.ADMIN_PRIVATE_KEY,
        this.provider
      );

      // Contract instance with admin signer
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.abi,
        this.adminWallet
      );

      logger.info(`✅ Blockchain service initialized`);
      logger.info(`📡 Network: ${process.env.BLOCKCHAIN_NETWORK}`);
      logger.info(`📄 Contract: ${this.contractAddress}`);
    } catch (err) {
      logger.error("❌ Blockchain initialization failed:", err.message);
    }
  }

  // ==================== WALLET ENCRYPTION ====================

  /**
   * Generate a new Ethereum wallet for a user
   */
  generateUserWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic: wallet.mnemonic?.phrase,
    };
  }

  /**
   * Encrypt private key with user-specific secret
   */
  encryptPrivateKey(privateKey, userId) {
    const secret = process.env.ENCRYPTION_SECRET + userId;
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(secret, "blockpay-salt", 32);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  }

  /**
   * Decrypt private key
   */
  decryptPrivateKey(encryptedKey, userId) {
    const secret = process.env.ENCRYPTION_SECRET + userId;
    const [ivHex, encrypted] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(secret, "blockpay-salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Get a signer for a specific user's wallet
   */
  getUserSigner(encryptedPrivateKey, userId) {
    const privateKey = this.decryptPrivateKey(encryptedPrivateKey, userId);
    return new ethers.Wallet(privateKey, this.provider);
  }

  // ==================== WALLET OPERATIONS ====================

  /**
   * Create wallet on blockchain for a user
   */
  async createBlockchainWallet(userId) {
    try {
      const walletData = this.generateUserWallet();
      const tx = await this.contract.createWallet(userId.toString());
      const receipt = await tx.wait(1);

      return {
        success: true,
        address: walletData.address,
        privateKey: walletData.privateKey,
        publicKey: walletData.publicKey,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (err) {
      logger.error("createBlockchainWallet error:", err);
      throw new Error(`Blockchain wallet creation failed: ${err.message}`);
    }
  }

  /**
   * Get wallet balance from blockchain
   */
  async getOnChainBalance(walletAddress) {
    try {
      const balance = await this.contract.getWalletBalance(walletAddress);
      return ethers.formatEther(balance);
    } catch (err) {
      logger.error("getOnChainBalance error:", err);
      return "0";
    }
  }

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Execute a transfer between two blockchain wallets
   */
  async executeTransfer({
    senderPrivateKey,
    senderId,
    receiverAddress,
    amountInEther,
    metadata = "",
  }) {
    try {
      const senderSigner = new ethers.Wallet(senderPrivateKey, this.provider);
      const contractWithSender = this.contract.connect(senderSigner);

      const amountInWei = ethers.parseEther(amountInEther.toString());

      // Estimate gas
      const gasEstimate = await contractWithSender.transferFunds.estimateGas(
        receiverAddress,
        amountInWei,
        metadata
      );

      const tx = await contractWithSender.transferFunds(
        receiverAddress,
        amountInWei,
        metadata,
        { gasLimit: (gasEstimate * 120n) / 100n } // 20% buffer
      );

      const receipt = await tx.wait(1);

      // Parse event logs
      const transferEvent = receipt.logs
        .map((log) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e && e.name === "MoneyTransferred");

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractTxId: transferEvent?.args?.txId?.toString(),
        onChainTxHash: transferEvent?.args?.txHash,
      };
    } catch (err) {
      logger.error("executeTransfer error:", err);
      throw new Error(`Blockchain transfer failed: ${err.message}`);
    }
  }

  /**
   * Execute bill payment on blockchain
   */
  async executeBillPayment({
    payerPrivateKey,
    billType,
    providerId,
    accountNumber,
    amountInEther,
  }) {
    try {
      const payerSigner = new ethers.Wallet(payerPrivateKey, this.provider);
      const contractWithPayer = this.contract.connect(payerSigner);

      const amountInWei = ethers.parseEther(amountInEther.toString());

      const tx = await contractWithPayer.payBill(
        billType,
        providerId,
        accountNumber,
        amountInWei
      );

      const receipt = await tx.wait(1);

      const billEvent = receipt.logs
        .map((log) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e && e.name === "BillPaid");

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractTxId: billEvent?.args?.txId?.toString(),
        receiptHash: billEvent?.args?.receiptHash,
      };
    } catch (err) {
      logger.error("executeBillPayment error:", err);
      throw new Error(`Blockchain bill payment failed: ${err.message}`);
    }
  }

  // ==================== QUERY OPERATIONS ====================

  async getTransactionDetails(txId) {
    try {
      const tx = await this.contract.getTransactionDetails(txId);
      return {
        txId: tx.txId.toString(),
        sender: tx.sender,
        receiver: tx.receiver,
        amount: ethers.formatEther(tx.amount),
        fee: ethers.formatEther(tx.fee),
        type: tx.txType,
        metadata: tx.metadata,
        status: ["PENDING", "COMPLETED", "FAILED", "REVERSED"][tx.status],
        timestamp: new Date(Number(tx.timestamp) * 1000).toISOString(),
        txHash: tx.txHash,
      };
    } catch (err) {
      logger.error("getTransactionDetails error:", err);
      throw err;
    }
  }

  async verifyTransaction(txHash) {
    try {
      const isValid = await this.contract.verifyTransactionHash(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        isValid,
        onChain: !!receipt,
        blockNumber: receipt?.blockNumber,
        confirmations: receipt
          ? (await this.provider.getBlockNumber()) - receipt.blockNumber
          : 0,
      };
    } catch (err) {
      logger.error("verifyTransaction error:", err);
      return { isValid: false, onChain: false };
    }
  }

  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const gasPrice = await this.provider.getFeeData();
    return {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber,
      gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei") + " gwei",
    };
  }

  /**
   * Listen for real-time events from the contract
   */
  listenForEvents(io) {
    this.contract.on("MoneyTransferred", (txId, sender, receiver, amount, fee, txHash, timestamp, event) => {
      logger.info(`📡 Blockchain event: MoneyTransferred - TxID ${txId}`);
      const payload = {
        event: "MoneyTransferred",
        txId: txId.toString(),
        sender,
        receiver,
        amount: ethers.formatEther(amount),
        fee: ethers.formatEther(fee),
        txHash,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
      };
      io.to(`wallet_${sender}`).emit("transaction_confirmed", payload);
      io.to(`wallet_${receiver}`).emit("money_received", payload);
    });

    this.contract.on("BillPaid", (txId, payer, billType, accountNumber, amount, receiptHash, timestamp) => {
      logger.info(`📡 Blockchain event: BillPaid - TxID ${txId}`);
      io.to(`wallet_${payer}`).emit("bill_paid", {
        event: "BillPaid",
        txId: txId.toString(),
        billType,
        accountNumber,
        amount: ethers.formatEther(amount),
        receiptHash,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
      });
    });

    logger.info("📡 Blockchain event listeners active");
  }
}

module.exports = new BlockchainService();
