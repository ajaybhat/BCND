const SHA256 = require('crypto-js/sha256');
const blockchain = require('./blockchainCRUDMethods');

class Block {
    constructor(data) {
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = new Date().getTime().toString().slice(0, -3);
        this.previousBlockHash = "";
    }
}

exports.createBlock = function(req, res) {
    let data = req.body;
    if(data.body) {
        data = data.body;
        let block = new Block(data);
        blockchain.getBlockHeight().then((height) => {
            if(height === 0) {
                let firstBlock = new Block("First block in the chain - Genesis block");
                firstBlock.hash = SHA256(JSON.stringify(firstBlock)).toString();
                blockchain.addDataToLevelDB(JSON.stringify(firstBlock)).then(() => {
                    block.previousBlockHash = firstBlock.hash;
                    block.height = height + 1;
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    blockchain.addDataToLevelDB(JSON.stringify(block))
                        .then(() => res.send(block))
                        .catch((error) => res.send(error));
                }).catch((error) => res.send(error));
            } else {
                blockchain.getBlock(height - 1).then((prevBlock) => {
                    block.previousBlockHash = prevBlock.hash;
                    block.height = height;
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    blockchain.addDataToLevelDB(JSON.stringify(block))
                        .then(() => res.send(block))
                        .catch((error) => res.send(error));
                }).catch((error) => res.send(error));
            }
        }).catch((error) => res.send(error));
    } else {
        res.send({"error": "Request body not found"})
    }
};

exports.blockDetails = function(req, res) {
    let blockId = req.params.blockId;
    blockchain.getBlock(blockId).then((block) => res.send(block)).catch((error) => res.send(error));
};
