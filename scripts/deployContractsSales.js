const { ethers, network } = require("hardhat");
const { listnerForTransactionMine, validateDeploy, computeResourceID, saveBlockchain } = require("./helper")
const { MINTER_ROLE, URL_POE1, PK_ADMIN_SALES, SALES_CHAIN_ID } = require("./constants")
const { Blockchain } = require("./contractsABI/Blockchain");
const { bridgeDeployer, handlerDeployer } = require("./contractsDeployer");


async function main() {
  const provider = new ethers.providers.JsonRpcProvider(URL_POE1);
  const deployer = new ethers.Wallet(PK_ADMIN_SALES, provider);
  const resourceID = computeResourceID("Restaurant");
  console.log(resourceID);
  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  try {
    const bridge = await bridgeDeployer(deployer, SALES_CHAIN_ID)
    const handler = await handlerDeployer(deployer, bridge.address);

    const blockChainSales = new Blockchain(URL_POE1, SALES_CHAIN_ID, bridge.address, handler.address);
    saveBlockchain(blockChainSales)
    //updateRelayes();

  } catch (error) {
    console.log(error);
  }


  // const TokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser", deployer);
  // const token = await TokenFactory.deploy("Money", "MNY");
  // console.log("Token deployed to:", token.address);


  // /* Sales CONFIGURATION */
  // const SalesFactory = await ethers.getContractFactory("Sales", deployer);
  // const balance = await SalesFactory.deploy(
  //   bridge.address,
  //   token.address,
  //   handler.address,
  //   resourceID);
  //   console.log("Sales deployed to:", balance.address);

  //   await token.grantRole(MINTER_ROLE, handler.address)
  //   console.log("Mining Role to Handler contract")
  //   await token.grantRole(MINTER_ROLE, balance.address)
  //   console.log("Mining Role to Sales contract")
  //   try {
  //     //(address handlerAddress, bytes32 resourceID, address tokenAddress)
  //     const regResTx = await bridge.adminSetResource(handler.address, resourceID, token.address);
  //     await listnerForTransactionMine(regResTx, provider);
  //     console.log("Resource registered");
  //     const burnResTx = await bridge.adminSetBurnable(handler.address, token.address);
  //     await listnerForTransactionMine(burnResTx, provider);
  //     console.log("Resource set as burnable");
  //     const balanceRegTx = await bridge.setSalesAddress(balance.address, resourceID);
  //     await listnerForTransactionMine(balanceRegTx, provider);
  //     console.log("Sales contract registered")
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   validateDeploy(bridge, handler, token, balance, resourceID, "balance")
  //   blockChainSales.resourceIDToken[resourceID] = token.address;
  //   blockChainSales.resourceIDSales[resourceID] = balance.address;

}

main()