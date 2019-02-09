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

app.listen(8000, () => console.log('Blockchain API available on port 8000'));
