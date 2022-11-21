const { abi } = require("../../contracts/handlers/artifacts/ERC20Handler.json");

module.exports = {
    getHandlerABI: function () {
        return abi;
    },
};