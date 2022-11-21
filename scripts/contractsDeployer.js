const { ethers } = require("hardhat");
const { relayerThreshold, RELAYER_1, RELAYER_2, RELAYER_3, RELAYER_4, RELAYER_5 } = require("./constants");
const { getBridgeABI } = require("./contractsABI/BridgeABI");
const { getHandlerABI } = require("./contractsABI/HandlerABI");


async function checkDeploymentGas(Factory, deployer) {
    const gasPrice = await deployer.getGasPrice();
    const estimatedGas = await deployer.estimateGas(
        Factory.getDeployTransaction(arguments[2], arguments[3]), { gasLimit: 5000000 }
    )
    console.log("Estimated gas: " + estimatedGas);
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await deployer.getBalance();
    console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    if (Number(deployerBalance) < Number(deploymentPrice)) {
        throw new Error("You dont have enough balance to deploy.");
    }
}

const relayers = [
    RELAYER_1.chains[0].from, 
    RELAYER_2.chains[0].from, 
    RELAYER_3.chains[0].from,  
    RELAYER_4.chains[0].from,  
    RELAYER_5.chains[0].from
]

module.exports = {
    /**
     * 
     * @param {*} deployer 
     * @param {*} blockChainID 
     * @param {*} bridgeAddress 
     * @returns 
     */
    bridgeDeployer: async function (deployer, blockChainID, bridgeAddress = "") {
        var bridge;
        if (bridgeAddress.length == 0) {
            console.log("Deploying new bridge");
            const BridgeFactory = await ethers.getContractFactory("Bridge", deployer);
            //checkDeploymentGas(BridgeFactory, deployer, blockChainID, relayers, relayerThreshold, 0, 10000);
            bridge = await BridgeFactory.deploy(blockChainID, relayers, relayerThreshold, 0, 10000);
            console.log("Bridge deployed to:", bridge.address);
        } else {
            console.log("Bridge already deployed");
            bridge = new ethers.Contract(bridgeAddress, getBridgeABI(), deployer);
        }
        return bridge;
    },

    /**
     * 
     * @param {*} deployer 
     * @param {*} bridgeAddress 
     * @param {*} handlerAddress 
     * @returns 
     */
    handlerDeployer: async function (deployer, bridgeAddress, handlerAddress = "") {
        var handler;
        if (handlerAddress.length == 0) {
            console.log("Deploying new Handler");
            const HandlerFactory = await ethers.getContractFactory("ERC20Handler", deployer);
            //checkDeploymentGas(HandlerFactory, deployer, bridgeAddress);
            handler = await HandlerFactory.deploy(bridgeAddress, { gasLimit: 5000000 });
            console.log("Handler deployed to:", handler.address);
        } else {
            console.log("Handler already deployed");
            handler = new ethers.Contract(handlerAddress, getHandlerABI(), deployer);
        }
        return handler;
    },

    /**
     * 
     * @param {*} deployer 
     * @param {*} tokenName 
     * @param {*} tokenSymbol 
     * @returns 
     */
    tokenDeployer: async function (deployer, tokenName, tokenSymbol) {
        console.log("Deploying Token")
        const TokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser", deployer);
        TokenFactory.connect(deployer)
        checkDeploymentGas(TokenFactory, deployer, tokenName, tokenSymbol);
        const token = await TokenFactory.deploy(tokenName, tokenSymbol, { gasLimit: 5000000 });
        console.log("Token deployed to:", token.address);
        return token;
    }

}