const { abi } = require("../../node_modules/@openzeppelin/contracts/token/ERC20/presets/artifacts/ERC20PresetMinterPauser.json");

module.exports = {
    getTokenABI: function () {
        return abi;
    },
};