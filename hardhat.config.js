require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('@openzeppelin/hardhat-upgrades');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.11",
  networks: {
    poe1: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      timeout: 60000
    },
    poe2: {
      url: "http://localhost:11002",
      chainId: 200,
      timeout: 60000
    },
  }
};
