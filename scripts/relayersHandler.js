const { RELAYER_1, RELAYER_2, RELAYER_3 } = require("./constants")
const { loadBlockchain, computeResourceID } = require("./helper")
const fs = require('fs');

function updateRelayes() {
    const relayersFolder = "chainbridge-core-example/config/";
    var relayers = [];
    var relayersChains = {};
    relayers.push(RELAYER_1);
    relayers.push(RELAYER_2);
    relayers.push(RELAYER_3);
    relayers.forEach(relayer => {
        relayersChains[computeResourceID(JSON.stringify(relayer))] = relayer.chains
    });
    const chainsFolder = "chains/";
    const files = fs.readdirSync(chainsFolder)
    var newChains = [];
    files.forEach(file => {
        const data = fs.readFileSync(chainsFolder + file, "utf8");
        const newChain = JSON.parse(data)
        newChains.push(newChain)
    });

/*     console.log("Adding " + newChains.length + " new chains");
    console.log(newChains); */
    relayers.forEach(relayer => {
        /* console.log("New relayer"); */
        var oldChains = [];
        oldChains = relayersChains[computeResourceID(JSON.stringify(relayer))];
        if (newChains.length > oldChains.length) {
            for (let index = 0; index < newChains.length - oldChains.length; index++) {
                /* console.log("AGGIUNGO UNA CHAIN"); */
                var addedChain = Object.assign({},oldChains[0]);
                var newChainIndex = oldChains.length + 1 + index;
                addedChain.name = "polygon" + newChainIndex;
                oldChains.push(addedChain);
            }
        }
        for (let index = 0; index < newChains.length; index++) {
            oldChains[index].id = newChains[index].ID;
            oldChains[index].endpoint = newChains[index].URL;
            oldChains[index].bridge = newChains[index].bridgeAddress;
            oldChains[index].erc20Handler = newChains[index].handlerAddress;
        }
        relayersChains[computeResourceID(JSON.stringify(relayer))] = oldChains;
    });
    let index = 1;
    relayers.forEach(relayer => {
        relayer.chains =  relayersChains[computeResourceID(JSON.stringify(relayer))];
        const filename = "chainbridge-core-example/config/relayer_" + index + ".json";
        const jsonString = JSON.stringify(relayer);
        fs.writeFileSync(filename, jsonString, (err) => {
            if (err) {
                throw err;
            }
            console.log("Relayer data updated.");
        });
        index++;
    });
}

module.exports = {
    updateRelayes
}

updateRelayes()

