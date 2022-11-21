const { ethers } = require("hardhat");
const { listnerForTransactionMine, validateDeploy, computeResourceID, saveBlockchain } = require("./helper")
const { MINTER_ROLE ,URL_POE2, REVIEWS_CHAIN_ID, PK_ADMIN_REVIEW } = require("./constants")
const { Blockchain } = require("./contractsABI/Blockchain");
const { bridgeDeployer, handlerDeployer } = require("./contractsDeployer");


async function main() {
  console.log(URL_POE2)
  const provider = new ethers.providers.JsonRpcProvider(URL_POE2);
  const deployer = new ethers.Wallet(PK_ADMIN_REVIEW, provider);
  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  
  const bridge = await bridgeDeployer(deployer, REVIEWS_CHAIN_ID)
  const handler = await handlerDeployer(deployer, bridge.address);
  
  const blockChainReviews = new Blockchain(URL_POE2, REVIEWS_CHAIN_ID, bridge.address, handler.address);
  saveBlockchain(blockChainReviews);
  //updateRelayes();
  
/* 

  const TokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
  const token = await TokenFactory.deploy("Permission", "PRM");
  console.log("TokenPermission contract deployed to:", token.address);

  const ReviewsFactory = await ethers.getContractFactory("Reviews");
  const review = await ReviewsFactory.deploy(
    bridge.address,
    token.address,
    handler.address,
    resourceID);
  console.log("Reviews contract deployed to:", review.address);

  await token.grantRole(MINTER_ROLE, handler.address)
  console.log("Mining Role to Handler contract")

  await token.grantRole(MINTER_ROLE, review.address)
  console.log("Mining Role to Reviews contract")

  try {
    //(address handlerAddress, bytes32 resourceID, address tokenAddress)
    const regResTx = await bridge.adminSetResource(handler.address, resourceID, token.address);
    await listnerForTransactionMine(regResTx, provider);
    console.log("Resource registered");
    const burnResTx = await bridge.adminSetBurnable(handler.address, token.address);
    await listnerForTransactionMine(burnResTx, provider);
    console.log("Resource set as burnable");
    const reviewRegTx = await bridge.setReviewsAddress(review.address, resourceID);
    await listnerForTransactionMine(reviewRegTx, provider);
    console.log("Reviews contract registered")
  } catch (error) {
    console.log(error);
  }

  validateDeploy(bridge, handler, token, review, resourceID, "review");

  blockChainReviews.resourceIDToken[resourceID] = token.address;
  blockChainReviews.resourceIDReviews[resourceID] = review.address;
 */
}

main()