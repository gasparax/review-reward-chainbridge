const { ethers } = require("hardhat");
const { getBridgeABI } = require("./contractsABI/BridgeABI");
const { Blockchain } = require("./contractsABI/Blockchain");
const { listnerForTransactionMine, validateDeploy, saveBlockchain, loadBlockchain, computeResourceID } = require("./helper")
const { URL_POE1, URL_POE2, MINTER_ROLE, ADMIN_ROLE, PK_RESTAURANT_1, PK_RESTAURANT_2, PK_RESTAURANT_1_REVIEW, PK_RESTAURANT_1_SALES, getSigner, PK_ADMIN_SALES, PK_ADMIN_REVIEW, REVIEWS_CHAIN_ID, SALES_CHAIN_ID } = require("../scripts/constants");
const { bridgeDeployer, handlerDeployer, tokenDeployer } = require("./contractsDeployer");
const { getTokenABI } = require("./contractsABI/TokenABI");
//const { updateRelayes } = require("./relayersHandler");


const BridgeABI = getBridgeABI();

const salesEmoji = String.fromCodePoint(0x1F4B5);
const raviewEmoji = String.fromCodePoint(0x1F4D1);

const restaurantName = "Branzo";
const resourceID = computeResourceID(restaurantName);

async function infrastructureDeployer() {
    const providerSales = new ethers.providers.JsonRpcProvider(URL_POE1);
    const providerReviews = new ethers.providers.JsonRpcProvider(URL_POE2);
    const salesFeeData = await providerSales.getFeeData();
    const reviewFeeData = await providerReviews.getFeeData();


    const deployerPKSales = PK_RESTAURANT_1_SALES;
    const deployerPKReviews = PK_RESTAURANT_1_REVIEW;
    var BlockChainSales = new Blockchain(URL_POE1, SALES_CHAIN_ID, "", "");
    var BlockChainReviews = new Blockchain(URL_POE2, REVIEWS_CHAIN_ID, "", "");


    const deployerSales = new ethers.Wallet(deployerPKSales, providerSales);
    const deployerReviews = new ethers.Wallet(deployerPKReviews, providerReviews);

    console.log("Account sales SALES:", (await deployerSales.getBalance()).toString());
    console.log("Account sales REVIEW:", (await deployerReviews.getBalance()).toString());

    const adminSales = new ethers.Wallet(PK_ADMIN_SALES, providerSales);
    const adminReviews = new ethers.Wallet(PK_ADMIN_REVIEW, providerReviews);


    const load = true;
    if (load) {
        console.log("Load blockchains from files");
        var loadedChainSales = loadBlockchain("../chains/chain1.json");
        var loadedChainReviews = loadBlockchain("../chains/chain2.json");

        BlockChainSales.bridgeAddress = loadedChainSales.bridgeAddress;
        BlockChainReviews.bridgeAddress = loadedChainReviews.bridgeAddress;

        BlockChainSales.handlerAddress = loadedChainSales.handlerAddress;
        BlockChainReviews.handlerAddress = loadedChainReviews.handlerAddress;

    }

    var bridgeSales = await bridgeDeployer(deployerSales, SALES_CHAIN_ID, BlockChainSales.bridgeAddress);
    var bridgeReviews = await bridgeDeployer(deployerReviews, REVIEWS_CHAIN_ID, BlockChainReviews.bridgeAddress);

    BlockChainSales.bridgeAddress = bridgeSales.address;
    BlockChainReviews.bridgeAddress = bridgeReviews.address;

    const handlerSales = await handlerDeployer(deployerSales, bridgeSales.address, BlockChainSales.handlerAddress);
    const handlerReviews = await handlerDeployer(deployerReviews, bridgeReviews.address, BlockChainReviews.handlerAddress);
    BlockChainSales.handlerAddress = handlerSales.address;
    BlockChainReviews.handlerAddress = handlerReviews.address;

    // if (load) {
    //     // It's needed to add the restaurant address the role of admin
    //     // in the bridge to register a new token.
    //     var adminTx = await bridgeSales.connect(adminSales).grantRole(ADMIN_ROLE, deployerSales.address);
    //     await listnerForTransactionMine(adminTx, providerSales);
    //     adminTx = await bridgeReviews.connect(adminReviews).grantRole(ADMIN_ROLE, deployerReviews.address);
    //     await listnerForTransactionMine(adminTx, providerReviews);
    // }

    /* CONFIGURATION SALES CHAIN */
    console.log(salesEmoji + " - DEPLOYING on SALES chian - " + salesEmoji);
    const tokenSales = await tokenDeployer(deployerSales, "Money", "MNY");
    console.log("Deployng sales contract");
    /* Balance CONFIGURATION */
    const SalesFactory = await ethers.getContractFactory("Sales", deployerSales);
    const estimatedGasSales = await deployerSales.estimateGas(
        SalesFactory.getDeployTransaction(deployerSales.address,
            handlerReviews.address,
            tokenSales.address,
            resourceID), { gasLimit: 5000000 }
    )
    console.log("Estimated gas for Sales Contract: " + estimatedGasSales);
    const sales = await SalesFactory.deploy(
        bridgeSales.address,
        handlerSales.address,
        tokenSales.address,
        resourceID);
    console.log("Sales deployed to:", sales.address);

    console.log("Grant Minting Role - Handler");
    const mintRoleHandler = await tokenSales.grantRole(MINTER_ROLE, handlerSales.address, { gasLimit: 8000000 });
    await listnerForTransactionMine(mintRoleHandler, providerSales);
    console.log("Mining Role to Handler contract");
    console.log("Grant Minting Role - Sales");
    const mintRoleSales = await tokenSales.grantRole(MINTER_ROLE, sales.address, { gasLimit: 8000000 });
    await listnerForTransactionMine(mintRoleSales, providerSales);
    console.log("Mining Role to Sales contract");
    try {
        //(address handlerAddress, bytes32 resourceID, address tokenAddress)
        const regResTx = await bridgeSales.connect(adminSales).adminSetResource(handlerSales.address, resourceID, tokenSales.address, { gasLimit: 3000000 });
        await listnerForTransactionMine(regResTx, providerSales);
        console.log("Resource registered");
        const burnResTx = await bridgeSales.connect(adminSales).adminSetBurnable(handlerSales.address, tokenSales.address, { gasLimit: 3000000 });
        await listnerForTransactionMine(burnResTx, providerSales);
        console.log("Resource set as burnable");
        const salesRegTx = await bridgeSales.connect(adminSales).setSalesAddress(sales.address, resourceID, { gasLimit: 3000000 });
        await listnerForTransactionMine(salesRegTx, providerSales);
        console.log("Sales contract registered")
    } catch (error) {
        console.log(error);
    }

    /* Validation contract deployment on sales chain */
    await validateDeploy(deployerSales, bridgeSales, handlerSales, tokenSales, sales, resourceID, "sales")

    BlockChainSales.resourceIDToken[resourceID] = tokenSales.address;
    BlockChainSales.resourceIDSales[resourceID] = sales.address;

    saveBlockchain(BlockChainSales)

    /* CONFIGURATION REVIEW CHAIN */
    console.log(raviewEmoji + " - DEPLOYING on REVIEW chian - " + raviewEmoji);

    const tokenReviews = await tokenDeployer(deployerReviews, "Permission", "PRM");
    const ReviewsFactory = await ethers.getContractFactory("Reviews", deployerReviews);
    const estimatedGasReviews = await deployerReviews.estimateGas(
        ReviewsFactory.getDeployTransaction(bridgeReviews.address,
            handlerReviews.address,
            tokenReviews.address,
            resourceID), { gasLimit: 5000000 }
    )
    console.log("Estimated gas for Reviews Contract: " + estimatedGasReviews);
    const review = await ReviewsFactory.deploy(
        bridgeReviews.address,
        handlerReviews.address,
        tokenReviews.address,
        resourceID);
    console.log("Reviews contract deployed to:", review.address);

    await tokenReviews.grantRole(MINTER_ROLE, handlerReviews.address)
    console.log("Mining Role to Handler contract")

    await tokenReviews.grantRole(MINTER_ROLE, review.address)
    console.log("Mining Role to Reviews contract")

    try {
        console.log("Registering resource at bridge");
        const regResTx = await bridgeReviews.connect(adminReviews).adminSetResource(handlerReviews.address, resourceID, tokenReviews.address);
        await listnerForTransactionMine(regResTx, providerReviews).finally(console.log("Resource registered"));
        console.log("Registering resource as burnable");
        const burnResTx = await bridgeReviews.connect(adminReviews).adminSetBurnable(handlerReviews.address, tokenReviews.address);
        await listnerForTransactionMine(burnResTx, providerReviews).finally(console.log("Resource set as burnable"));
        console.log("Registering review at bridge");
        const reviewRegTx = await bridgeReviews.connect(adminReviews).setReviewsAddress(review.address, resourceID);
        await listnerForTransactionMine(reviewRegTx, providerReviews).finally(console.log("Reviews contract registered"));
    } catch (error) {
        console.log(error.reason);
    }

    /* Validation contract deployment on review chain */
    await validateDeploy(adminReviews, bridgeReviews, handlerReviews, tokenReviews, review, resourceID, "review")

    BlockChainReviews.resourceIDToken[resourceID] = tokenReviews.address;
    BlockChainReviews.resourceIDReviews[resourceID] = review.address;

    saveBlockchain(BlockChainReviews);
}


infrastructureDeployer()

