const SHA256 = require('crypto-js/sha256');
const blockchain = require('./blockchainCRUDMethods');
const bitcoin = require('bitcoinjs-lib'); // v3.x.x
const bitcoinMessage = require('bitcoinjs-message');

class Block {
    constructor(data) {
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = new Date().getTime().toString();
        this.previousBlockHash = "";
    }
}

exports.createBlock = (req, res) => {
    let data = req.body;
    if (data.address && data.star) {
        let star = data.star;
        if (star.dec && star.ra) {
            if (star.story.split(' ').length <= 250) {
                let block = new Block(data);
                blockchain.getBlockHeight().then((height) => {
                    if (height === 0) {
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
                res.send({"error": "star_story data for star is limited to 250 words"});
            }
        } else {
            res.send({"error": "right_ascension and declination data for star is required."});
        }
    } else {
        res.send({"error": "Wallet address and star data is required."});
    }
};

exports.blockDetailsByAddress = (req, res) => {
    let walletAddress = req.params.walletAddress;
    blockchain.getBlocksByAddress(walletAddress)
        .then((data) => res.send(data))
        .catch((error) => res.send({"error": error}));
};

exports.blockDetailsByBlockHash = (req, res) => {
    let blockHash = req.params.blockHash;
    blockchain.getBlockByHash(blockHash)
        .then((data) => res.send(data))
        .catch((error) => res.send({"error": error}));
};

exports.blockDetails = (req, res) => {
    let blockId = req.params.blockId;
    blockchain.getBlock(blockId)
        .then((block) => res.send(block))
        .catch((error) => res.send(error));
};

exports.requestValidation = (req, res) => {
    let data = req.body;
    if (data.address) {
        let walletAddress = data.address;
        blockchain.getLevelValidationDBData(walletAddress).then((request) => {
            let oldDate = new Date(parseFloat(request.requestTimeStamp)).getTime();
            let newDate = new Date().getTime();
            let timeDifference = (300 - ((newDate - oldDate) / 1000)).toString();
            if(timeDifference > 0) {
                request.validationWindow = timeDifference;
                blockchain.addLevelValidationDBData(walletAddress, JSON.stringify(request)).then(() => {
                    res.send(request);
                }).catch((error) => {
                    res.send(error);
                });
            } else {
                request.validationWindow = 300;
                request.requestTimeStamp = new Date().getTime().toString();
                request.message = walletAddress + ":" + request.requestTimeStamp + ":" + "starRegistry";
                blockchain.addLevelValidationDBData(walletAddress, JSON.stringify(request)).then(() => {
                    res.send(request);
                }).catch((error) => {
                    res.send(error);
                });
            }
        }).catch(() => {
            let request = {};
            request.address = walletAddress;
            request.requestTimeStamp = new Date().getTime().toString();
            request.message = walletAddress + ":" + request.requestTimeStamp + ":" + "starRegistry";
            request.validationWindow = 300;
            blockchain.addLevelValidationDBData(walletAddress, JSON.stringify(request)).then(() => {
                console.log(JSON.stringify(request));
                res.send(request);
            }).catch((error) => {
                res.send(error);
            });
        });
    } else {
        res.send({"error": "Wallet address is required."});
    }
};

exports.verifySignature = (req, res) => {
    let data = req.body;
    if (data.address && data.signature) {
        let walletAddress = data.address;
        let messageSignature = data.signature;
        blockchain.getLevelValidationDBData(walletAddress).then((request) => {
            let oldDate = new Date(parseFloat(request.requestTimeStamp)).getTime();
            let newDate = new Date().getTime();
            let timeDifference = (300 - ((newDate - oldDate) / 1000)).toString();
            if(timeDifference > 0) {
                request.validationWindow = timeDifference;
                let message = request.message;
                let isValid = bitcoinMessage.verify(message, walletAddress, messageSignature);
                if(isValid) {
                    let result = {};
                    result.registerStar = isValid;
                    result.status = request;
                    result.status.messageSignature = "valid";
                    res.send(result);
                } else {
                    res.send({"error": "Invalid message Signature"});
                }
            } else {
                res.send({"error": "Time Expired"});
            }
        }).catch(() => {
            res.send({"error": "Request can't be created"});
        });
    } else {
        res.send({"error": "Wallet address and message signature is required."});
    }
};
