const { ethers } = require("hardhat");
const { MINTER_ROLE } = require("./constants")
const { Blockchain } = require("./contractsABI/Blockchain")

module.exports = {
  /**
   * Function used to check the correct mining of the input transaction.
   * @param {*} txResponse 
   * @param {*} provider 
   * @returns 
   */
  listnerForTransactionMine: function (txResponse, provider) {
    return new Promise((resolve, reject) => {
      provider.once(txResponse.hash, (txRecived) => {
        console.log(
          `Tx Hash ${txRecived.transactionHash} completed with ${txRecived.confirmations} confirmations 
           Gas used: ${txRecived.gasUsed}`)
        resolve()
      })
    })
  },
  /**
   * Computes the resourceID need to register a new restaurant in both chains.
   * @param {*} inputString 
   * @returns 
   */
  computeResourceID: function (inputString) {
    return ethers.utils.keccak256((ethers.utils.toUtf8Bytes(inputString)));
  },
  /**
   * 
   * @param {*} bridge 
   * @param {*} handler 
   * @param {*} token 
   * @param {*} review 
   */
  validateDeploy: async function (signer, bridge, handler, token, customc, resourceID, nameCustomC) {
    correctEmoji = String.fromCodePoint(0x2705);
    incorrectEmoji = String.fromCodePoint(0x274C);
    const handlerMapping = await bridge.connect(signer).getHandlerByResourceID(resourceID)
    var customcCheckRegistration;
    var customcCheckMinter;
    if (nameCustomC === "review") {
      customcCheckRegistration = await bridge.connect(signer).getReviewsAddress(resourceID)
      customcCheckMinter = token.hasRole(MINTER_ROLE, customc.address)
    } else {
      customcCheckRegistration = await bridge.connect(signer).getSalesAddress(resourceID)
      customcCheckMinter = token.hasRole(MINTER_ROLE, customc.address)
    }
    const handlerMinterCheck = token.hasRole(MINTER_ROLE, handler.address)
    if (handlerMapping === handler.address) {
      console.log("Resource correctly registered " + correctEmoji)
    } else {
      console.log("Resource not registered " + incorrectEmoji)
    }
    if (customcCheckRegistration === customc.address) {
      console.log("customc contract correctly registered at the bridge " + correctEmoji)
    } else {
      console.log("customc contract not registered at the bridge " + incorrectEmoji)
    }
    if (handlerMinterCheck) {
      console.log("Handler contract correctly registered as Minter " + correctEmoji)
    } else {
      console.log("Handler contract not registered as Minter " + incorrectEmoji)
    }
    if (customcCheckMinter) {
      console.log("customc contract correctly registered as Minter " + correctEmoji)
    } else {
      console.log("customc contract not registered as Minter " + incorrectEmoji)
    }
  },
  /**
   * Used to serialize a blockchain object.
   * @param {*} objectBlockchain of the class blockchain
   */
  saveBlockchain: function (objectBlockchain) {
    const fs = require('fs');
    const chainID = objectBlockchain.ID;
    const jsonString = JSON.stringify(objectBlockchain);
    const filename = `./chains/chain${chainID}.json`
    fs.writeFile(filename, jsonString, (err) => {
      if (err) {
        throw err;
      }
      console.log("Blockchain data saved.");
    });
  },

  loadBlockchain: function (filename) {
    const loadedChain = require(filename)
    var bc = new Blockchain(loadedChain.URL,
      loadedChain.ID,
      loadedChain.bridgeAddress,
      loadedChain.handlerAddress);

    bc.resourceIDToken = loadedChain.resourceIDToken;
    bc.resourceIDSales = loadedChain.resourceIDSales;
    bc.resourceIDReviews = loadedChain.resourceIDReviews;
    return bc;
  }
};

