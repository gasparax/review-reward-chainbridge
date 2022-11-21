const { ethers } = require("hardhat");

const MINTER_ROLE = ethers.utils.keccak256((ethers.utils.toUtf8Bytes("MINTER_ROLE")));
const ADMIN_ROLE = ethers.utils.keccak256((ethers.utils.toUtf8Bytes("0")));

function getSigner(URL, PK) {
    const provider = new ethers.providers.JsonRpcProvider(URL);
    const signer = new ethers.Wallet(PK, provider);
    return signer;
}

module.exports = {
    relayerThreshold: 3,
    MINTER_ROLE: MINTER_ROLE,
    ADMIN_ROLE: ADMIN_ROLE,
    SALES_CHAIN_ID: 1,
    REVIEWS_CHAIN_ID: 2,
    URL_POE1: `https://rpc-mumbai.maticvigil.com/`,
    URL_POE2: `https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
    RELAYER_1: require("../chainbridge-core-example/config/relayer_1.json"),
    RELAYER_2: require("../chainbridge-core-example/config/relayer_2.json"),
    RELAYER_3: require("../chainbridge-core-example/config/relayer_3.json"),
    RELAYER_4: require("../chainbridge-core-example/config/relayer_4.json"),
    RELAYER_5: require("../chainbridge-core-example/config/relayer_5.json"),
    PK_ADMIN_SALES: "private key chainbridge admin manager second chainbridge",
    PK_ADMIN_REVIEW: "private key chainbridge admin manager second chainbridge",
    PK_RESTAURANT_1_SALES: "private key restaurant manager first restaurant",
    PK_RESTAURANT_1_REVIEW: "private key restaurant manager first restaurant",
    PK_RESTAURANT_2: "<private key restaurant manager second restaurant>",
    getSigner,
};