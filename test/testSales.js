const { expect } = require("chai");
const { listnerForTransactionMine, computeResourceID } = require("../scripts/helper")
const { URL_POE1 } = require("../scripts/constants");
const { ethers } = require("hardhat");

describe("Sales contract", async () => {

    const bridgeAddress = "0x92EA802329e11e1ff5622794ab627f9162f7eBDc";
    const tokenAddress = "0x049e258e94e67a2D938ae1378C0666Fd6Bf07f02";
    const handlerAddress = "0x02b934Af83e67D46883f9d8ccC634aFD0B6372De";
    const resourceID = computeResourceID("TestSales");
    var deployer, user;
    var sales;

    beforeEach(async () => {
        [deployer, user] = await ethers.getSigners();
        const SalesFactory = await ethers.getContractFactory("Sales", deployer);
        sales = await SalesFactory.deploy(
            bridgeAddress,
            handlerAddress,
            tokenAddress,
            resourceID);
        });
        describe("setUserBill", () => {
            it("Test adding a new user bill as restaurnat", async () => {
    
                await sales.deployed();
                const bill = 100;
                await sales.setUserBill(deployer.address, bill);
    
                const resultGetBill = await sales.getBill();
    
                expect(resultGetBill.toNumber()).to.equal(bill);
            });
    
            it("Test adding a new user bill as user ", async () => {
                
                await sales.deployed();
                const bill = 100;
                await expect(sales.connect(user).setUserBill(user.address, bill)).
                    to.be.revertedWith("Only the restaurant owner can set a bill/discount");
            });
    
            it("Test adding a new user bill negative number ", async () => {
                
                await sales.deployed();
                const bill = -100;
                await expect(sales.connect(deployer).setUserBill(user.address, bill)).
                    to.be.reverted;
            });
        });

    describe("setUserDiscount", () => {
        var discount = 20;
        it("Test adding a new user discount as restaurnat", async () => {

            await sales.deployed();
            
            await sales.setUserDiscount(deployer.address, discount);

            const resultGetDiscount = await sales.getDiscount();

            expect(resultGetDiscount.toNumber()).to.equal(discount);
        });

        it("Test adding a new user discount as user ", async () => {
            
            await sales.deployed();
            await expect(sales.connect(user).setUserDiscount(user.address, discount)).
                to.be.revertedWith("Only the restaurant owner can set a bill/discount");
        });

        it("Test adding a new user discount negative number ", async () => {
            
            await sales.deployed();
            discount = -100;
            await expect(sales.connect(deployer).setUserDiscount(user.address, discount)).
                to.be.reverted;
        });
    });

});