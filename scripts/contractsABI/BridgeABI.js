const { abi } = require("../../artifacts/contracts/Bridge.sol/Bridge.json");

module.exports = {
    getBridgeABI: function () {
        return abi;
    },
};