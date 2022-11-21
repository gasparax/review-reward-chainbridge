const { abi } = require("../../artifacts/contracts/customc/Reviews.sol/Reviews.json");

module.exports = {
    getReviewsABI: function () {
        return abi;
    },
};