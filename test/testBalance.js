const { expect } = require("chai");
const { listnerForTransactionMine, computeResourceID } = require("../scripts/helper")
const { URL_POE1 } = require("../scripts/constants");
const { ethers } = require("hardhat");

describe("Balance contract", async () => {

    const bridgeAddress = "0x92EA802329e11e1ff5622794ab627f9162f7eBDc";
    const tokenAddress = "0x049e258e94e67a2D938ae1378C0666Fd6Bf07f02";
    const handlerAddress = "0x02b934Af83e67D46883f9d8ccC634aFD0B6372De";
    const resourceID = computeResourceID("TestBalance");
    var deployer, user;
    var balance;

    beforeEach(async () => {
        [deployer, user] = await ethers.getSigners();
        const BalanceFactory = await ethers.getContractFactory("Balance", deployer);
        balance = await BalanceFactory.deploy(
            bridgeAddress,
            tokenAddress,
            handlerAddress,
            resourceID);
        });
        describe("setUserBill", () => {
            it("Test adding a new user bill as restaurnat", async () => {
    
                await balance.deployed();
                const bill = 100;
                await balance.setUserBill(deployer.address, bill);
    
                const resultGetBill = await balance.getBill();
    
                expect(resultGetBill.toNumber()).to.equal(bill);
            });
    
            it("Test adding a new user bill as user ", async () => {
                
                await balance.deployed();
                const bill = 100;
                await expect(balance.connect(user).setUserBill(user.address, bill)).
                    to.be.revertedWith("Only the restaurant owner can set a bill/discount");
            });
    
            it("Test adding a new user bill negative number ", async () => {
                
                await balance.deployed();
                const bill = -100;
                await expect(balance.connect(deployer).setUserBill(user.address, bill)).
                    to.be.reverted;
            });
        });

    describe("setUserDiscount", () => {
        var discount = 20;
        it("Test adding a new user discount as restaurnat", async () => {

            await balance.deployed();
            
            await balance.setUserDiscount(deployer.address, discount);

            const resultGetDiscount = await balance.getDiscount();

            expect(resultGetDiscount.toNumber()).to.equal(discount);
        });

        it("Test adding a new user discount as user ", async () => {
            
            await balance.deployed();
            await expect(balance.connect(user).setUserDiscount(user.address, discount)).
                to.be.revertedWith("Only the restaurant owner can set a bill/discount");
        });

        it("Test adding a new user discount negative number ", async () => {
            
            await balance.deployed();
            discount = -100;
            await expect(balance.connect(deployer).setUserDiscount(user.address, discount)).
                to.be.reverted;
        });
    });

});