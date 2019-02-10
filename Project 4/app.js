const bodyParser = require('body-parser')
const express = require('express');
const app = express();

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
// to support JSON-encoded bodies
app.use(bodyParser.json());

//register the routes
let blockController = require('./blockController');
app.route('/block').post(blockController.createBlock);

app.route('/block/:blockId').get(blockController.blockDetails);

app.route('/stars/address::walletAddress').get(blockController.blockDetailsByAddress);

app.route('/stars/hash::blockHash').get(blockController.blockDetailsByBlockHash);

app.route('/requestValidation').post(blockController.requestValidation);

app.route('/message-signature/validate').post(blockController.verifySignature);

app.listen(8000, () => console.log('Blockchain API available on port 8000'));
