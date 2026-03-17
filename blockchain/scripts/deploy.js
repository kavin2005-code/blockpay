import pkg from 'hardhat';
const { ethers, artifacts } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Account:', deployer.address);
  const Factory = await ethers.getContractFactory('BlockPay');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log('Deployed to:', addr);
  const abiDir = path.join(__dirname, '../../backend/src/config');
  const art = await artifacts.readArtifact('BlockPay');
  fs.writeFileSync(path.join(abiDir, 'BlockPayABI.json'), JSON.stringify(art.abi, null, 2));
  console.log('ABI saved!');
  console.log('CONTRACT_ADDRESS=' + addr);
}

main().catch((e) => { console.error(e); process.exit(1); });