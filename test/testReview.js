const { expect } = require("chai");
const { listnerForTransactionMine, computeResourceID } = require("../scripts/helper")
const { URL_POE1 } = require("../scripts/constants");
const { ethers } = require("hardhat");

describe("Review contract", async () => {

    const bridgeAddress = "0x92EA802329e11e1ff5622794ab627f9162f7eBDc";
    const tokenAddress = "0x049e258e94e67a2D938ae1378C0666Fd6Bf07f02";
    const handlerAddress = "0x02b934Af83e67D46883f9d8ccC634aFD0B6372De";
    const resourceID = computeResourceID("TestReview");
    var deployer, user;
    var review;

    beforeEach(async () => {
        [deployer, user] = await ethers.getSigners();
        const ReviewFactory = await ethers.getContractFactory("Review", deployer);
        review = await ReviewFactory.deploy(
            bridgeAddress,
            tokenAddress,
            handlerAddress,
            resourceID);
        });
        describe("setUserPermission", () => {
            it("Test set a new user permission as restaurnat", async () => {
    
                await review.deployed();
                await review.setUserPermission(deployer.address);
    
                const resultPermssion = await review.checkPermission();
    
                expect(resultPermssion).true;
            });
    
            it("Test adding a new user permission as user ", async () => {
                
                await review.deployed();
                await expect(review.connect(user).setUserPermission(user.address)).
                    to.be.revertedWith("Only the restaurant owner can set a permission/reward");
            });
        });

    describe("setReward", () => {
        var reward = 20;
        it("Test adding a new reward as restaurnat", async () => {

            await review.deployed();
            
            await review.setReward(reward);

            const resultGetReward = await review.getReward();

            expect(resultGetReward.toNumber()).to.equal(reward);
        });

        it("Test adding a new reward as user ", async () => {
            
            await review.deployed();
            await expect(review.connect(user).setReward(reward)).
                to.be.revertedWith("Only the restaurant owner can set a permission/reward");
        });

        it("Test adding a new user reward negative number ", async () => {
            
            await review.deployed();
            reward = -100;
            await expect(review.connect(deployer).setReward(reward)).
                to.be.reverted;
        });
    });

});