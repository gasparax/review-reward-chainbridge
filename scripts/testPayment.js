const { ethers } = require("hardhat");
const { listnerForTransactionMine, validateDeploy, saveBlockchain, loadBlockchain, computeResourceID } = require("./helper")
const { getSalesABI } = require("../scripts/contractsABI/SalesABI");
const { getReviewsABI } = require("../scripts/contractsABI/ReviewsABI");
const { getBridgeABI } = require("../scripts/contractsABI/BridgeABI");
const { URL_POE1, URL_POE2, PK_RESTAURANT_1_REVIEW, PK_RESTAURANT_1_SALES, getSigner, PK_ADMIN_SALES } = require("../scripts/constants");

//BLOCKCHAIN FILES
const BlockChainSales = loadBlockchain("../chains/chain1.json")
const BlockChainReview = loadBlockchain("../chains/chain2.json")

//Restaurnat ID list
const IDList = Object.keys(BlockChainSales.resourceIDToken);

const SalesABI = getSalesABI();
const ReviewABI = getReviewsABI();
const BridgeABI = getBridgeABI();


const signerPKSales = PK_RESTAURANT_1_SALES;
const signerPKReview = PK_RESTAURANT_1_REVIEW;

async function test() {
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

    // Load the sales and reviews contracts for the ID 0
    const salesAddress = BlockChainSales.resourceIDSales[IDList[0]];
    const reviewsAddress = BlockChainReview.resourceIDReviews[IDList[0]];
    const sales = await new ethers.Contract(salesAddress, SalesABI, signerSales);
    const reviews = await new ethers.Contract(reviewsAddress, ReviewABI, signerReview);
    const startingBill = 100;
    var startTime =  performance.now();;
    try {
        let setBillTx = await sales.setUserBill(user.address, startingBill);
        console.log("Setting user bill -> wait for the mining");
        await listnerForTransactionMine(setBillTx, providerSales);
        console.log("Bill setted");
        console.log("Bill to pay: " + startingBill);
        console.log("Check for discount for the account ...")
        let txDiscountApplication = await sales.connect(user).applyDiscount();
        await listnerForTransactionMine(txDiscountApplication, providerSales);
        console.log("Discount applied");
        let actualBill = await sales.connect(user).getBill();
        var bill = actualBill.toNumber().toString();
        console.log("New bill to pay -> " + bill);
        console.log("Depoist -> wait for the mining");
        let depoistTx = await sales.connect(user).deposit({ value: ethers.utils.parseUnits(bill, 'wei')});
        await listnerForTransactionMine(depoistTx, providerSales);
        console.log("Depoist done");
        bridgeReview.on("ProposalEvent", async (originDomainID, depositNonce, status, dataHash) => {
            /*             console.log("------------------------Proposal Event REVIEW - PERMISSION-------------------------");
                        console.log("ORIGIN DOMAIN ID: " + originDomainID);
                        console.log("Deposit nonce: " + depositNonce.toNumber());
                        console.log("Status: " + status);
                        console.log(dataHash);
                        console.log("---------------------------------------------------------------"); */
            if (status === 3) {
                console.log("Event emitted - Permission released!");
                permCheckTx = await reviews.connect(userReview).checkPermission();
                if (permCheckTx == true) {
                    console.log("Permission is present!");
                    let votingTx = await reviews.connect(userReview).reviewRestaurant(8);
                    console.log("Voting -> wait for the mining");
                    console.log("Restaurant voted")
                    await listnerForTransactionMine(votingTx, providerReview);
                    console.log("Review released!");
                } else {
                    console.log("Permission is NOT present!");
                    return;
                }
            }
        })
        bridgeSales.on("ProposalEvent", async (originDomainID, depositNonce, status, dataHash) => {
            /*             console.log("------------------------Proposal Event SALES - REWARD -------------------------");
                        console.log("ORIGIN DOMAIN ID: " + originDomainID);
                        console.log("Deposit nonce: " + depositNonce.toNumber());
                        console.log("Status: " + status);
                        console.log(dataHash);
                        console.log("---------------------------------------------------------------"); */
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
        })
        bridgeSales.on("FailedHandlerExecution", async (lowLevelData) => {
            console.log("------------------------FailedHandlerExecution -------------------------");
            console.log(lowLevelData);
            console.log("---------------------------------------------------------------");
        })
    } catch (error) {
        console.error(error);
    }
}

test();

