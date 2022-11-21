module.exports = {
    Blockchain: class {
      constructor(URL, ID, bridgeAddress, handlerAddress) {
        this.URL = URL;
        this.ID = ID;
        this.bridgeAddress = bridgeAddress;
        this.handlerAddress = handlerAddress;
      }
      resourceIDToken = {}
      resourceIDSales = {}
      resourceIDReviews = {}
    }
  };