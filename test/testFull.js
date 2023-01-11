const { ethers } = require("hardhat");
const { listnerForTransactionMine, validateDeploy, saveBlockchain, loadBlockchain, computeResourceID } = require("../scripts/helper")
const { getSalesABI } = require("../scripts/contractsABI/SalesABI");
const { getReviewsABI } = require("../scripts/contractsABI/ReviewsABI");
const { getBridgeABI } = require("../scripts/contractsABI/BridgeABI");
const { URL_POE1, URL_POE2, PK_RESTAURANT_1_REVIEW, PK_RESTAURANT_1_SALES, getSigner, PK_ADMIN_SALES } = require("../scripts/constants");
const { getTokenABI } = require("../scripts/contractsABI/TokenABI");

//BLOCKCHAIN FILES
const BlockChainSales = loadBlockchain("../chains/chain1.json")
const BlockChainReview = loadBlockchain("../chains/chain2.json")

//Restaurnat ID list
const IDList = Object.keys(BlockChainSales.resourceIDToken);

const SalesABI = getSalesABI();
const ReviewABI = getReviewsABI();
const BridgeABI = getBridgeABI();
const TokenABI = getTokenABI();


const signerPKSales = PK_RESTAURANT_1_SALES;
const signerPKReview = PK_RESTAURANT_1_REVIEW;

async function test() {
    const restaurantName = "Branzo";
    const resourceID = computeResourceID(restaurantName);

    // Setup ethers provider and signers
    const providerSales = new ethers.providers.JsonRpcProvider(URL_POE1);
    const providerReview = new ethers.providers.JsonRpcProvider(URL_POE2);
    const signerSales = new ethers.Wallet(signerPKSales, providerSales);
    const signerReview = new ethers.Wallet(signerPKReview, providerReview);
    const user = getSigner(URL_POE1, PK_ADMIN_SALES);
    const userReview = getSigner(URL_POE2, PK_ADMIN_SALES);

    console.log("Account Balance SALES:", (await user.getBalance()).toString());

    // Setup infrastructure contracts 
    const bridgeSalesAddress = BlockChainSales.bridgeAddress;
    const bridgeSales = new ethers.Contract(bridgeSalesAddress, BridgeABI, signerSales);
    const bridgeReviewAddress = BlockChainReview.bridgeAddress;
    const bridgeReview = new ethers.Contract(bridgeReviewAddress, BridgeABI, signerReview);
    const tokenSalesAddress = BlockChainSales.resourceIDToken[IDList[0]];
    const tokenReviewsAddress = BlockChainReview.resourceIDToken[IDList[0]];
    const tokenSales = new ethers.Contract(tokenSalesAddress, TokenABI, signerSales);
    const tokenReviews = new ethers.Contract(tokenReviewsAddress, TokenABI, signerReview);

    // Load the sales and reviews contracts for the ID 0
    const salesAddress = BlockChainSales.resourceIDSales[IDList[0]];
    const reviewsAddress = BlockChainReview.resourceIDReviews[IDList[0]];
    const sales = await new ethers.Contract(salesAddress, SalesABI, signerSales);
    const reviews = await new ethers.Contract(reviewsAddress, ReviewABI, signerReview);
    const startingBill = 100;
    var startTime =  performance.now();
    //Start the test setting the bill for the customer
    try {
        let setBillTx = await sales.setUserBill(user.address, startingBill);
        console.log("Setting user bill -> wait for the mining");
        await listnerForTransactionMine(setBillTx, providerSales);
        console.log("Bill setted");
        console.log("Starting to pay: " + startingBill);
        let actulaDiscount = await sales.connect(user).getDiscount();
        console.log("Check for discount for the account ...")
        let discount = actulaDiscount.toNumber().toString();
        console.log('Discout ' + discount);
        let actualBill = await sales.connect(user).getBill();
        let bill = actualBill.toNumber().toString();
        console.log("After discount check the customer has to pay: " + bill);
        //Check if the customer has a discount
        if (discount > 0) {
            console.log("Approving -> wait for the mining");
            let approveTx = await tokenSales.approve(salesAddress, discount);
            await listnerForTransactionMine(approveTx, providerSales);
            console.log("Approved for discount token burning");
        }
        console.log("Bill Payment -> wait for the mining");
        let depoistTx = await sales.connect(user).payBill({ value: ethers.utils.parseUnits(bill, 'wei')});
        await listnerForTransactionMine(depoistTx, providerSales);
        console.log("Bill Payment done");
        //Wait for the relayers to forward the permission token
        bridgeReview.on("ProposalEvent", async (originDomainID, depositNonce, status, dataHash) => {
            if (status === 3) {
                console.log("Event emitted - Permission released!");
                permCheckTx = await reviews.connect(userReview).checkPermission();
                if (permCheckTx == true) {
                    console.log("Permission is present!");
                    console.log("Approving -> wait for the mining");
                    let approveTx = await tokenReviews.approve(reviewsAddress, discount);
                    await listnerForTransactionMine(approveTx, providerReview);
                    console.log("Approved for permission token burning");
                    console.log("Voting -> wait for the mining");
                    let votingTx = await reviews.connect(userReview).reviewRestaurant(8);
                    console.log("Restaurant voted")
                    await listnerForTransactionMine(votingTx, providerReview);
                    console.log("Review released!");
                } else {
                    console.log("Permission is NOT present!");
                    return;
                }
            }
            bridgeReview.removeAllListeners();
        })
        //Wait for the relayers to forward the discount tokens
        bridgeSales.on("ProposalEvent", async (originDomainID, depositNonce, status, dataHash) => {
            if (status === 3) {
                console.log("Event emitted - Reward released!");
                console.log(`SECOND RELAYERS EXECUTION took ${endTime - startTime} milliseconds`)
                permCheckTx = await reviews.connect(userReview).checkPermission();
                rewardCheckTx = await sales.connect(user).getDiscount();
                if (rewardCheckTx.toNumber() == 20) {
                    console.log("Reward released!");
                    console.log("Actual discount -> " + rewardCheckTx.toNumber().toString());
                    console.log("Test completed as expected " + String.fromCodePoint(0x2705));
                    var endTime = performance.now()
                    console.log(`COMPLETE EXECUTION took ${endTime - startTime} milliseconds`)
                    return;
                } else {
                    console.log("Reward not released!");
                    return;
                }
            }
            bridgeSales.removeAllListeners();
        })
        /*bridgeSales.on("FailedHandlerExecution", async (lowLevelData) => {
            console.log("------------------------FailedHandlerExecution -------------------------");
            console.log(lowLevelData);
            console.log("---------------------------------------------------------------");
        }) */
    } catch (error) {
        console.error(error);
    }
}

test();