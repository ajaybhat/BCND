const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const base64 = require('base-64');
const validation = './validation';
const validationDB = level(validation);

// Add data to levelDB with key/value pair
addLevelDBData = (key, data) => {
    data = JSON.parse(data);
    if(data.body.star) {
        data.body.star.storyDecoded = data.body.star.story;
        data.body.star.story = base64.encode(data.body.star.storyDecoded);
    }
    data = JSON.stringify(data);

    return new Promise((resolve, reject) =>
        db.put(key, data, error => {
            if (error) {
                reject('Block ' + key + ' submission failed', error);
            } else {
                resolve(data);
            }
        }));
};

// Get data from levelDB with key
exports.getLevelDBData = key =>
    new Promise((resolve, reject) =>
        db.get(key, (error, response) => {
            if (error) {
                reject('Not found!', error);
            } else {
                resolve(JSON.parse(response));
            }
        }));

// Add data to levelDB with value
exports.addDataToLevelDB = data =>
    new Promise((resolve, reject) => {
    let height = 0;
    db.createReadStream()
        .on('data', () => height++)
        .on('error', error => reject('Unable to read data stream!', error))
        .on('close', () => addLevelDBData(height, data)
            .then(() => resolve(JSON.parse(data)))
            .catch((error) => reject('Block ' + key + ' submission failed', error)));
});

// Get the height of the block
exports.getBlockHeight = () => new Promise((resolve, reject) => {
    let height = 0;
    db.createReadStream()
        .on('data', () => height++)
        .on('error', error => reject('Unable to read data stream!', error))
        .on('close', () => resolve(height));
});

// Get the block data
exports.getBlock = blockHeight =>
    new Promise((resolve, reject) =>
        db.get(blockHeight, (err, value) => {
            if (err) {
                reject('Not found!', err);
            } else {
                resolve(JSON.parse(value));
            }
        }));

// Add data to levelDB with key/value pair
exports.addLevelValidationDBData = (key, data) =>
    new Promise((resolve, reject) =>
        validationDB.put(key, data, error => {
            if (error) {
                reject('Block ' + key + ' submission failed', error);
            } else {
                resolve(data);
            }
        }));

// Get data from levelDB with key
exports.getLevelValidationDBData = key =>
    new Promise((resolve, reject) =>
        validationDB.get(key, (error, response) => {
            if (error) {
                reject('Not found!', error);
            } else {
                resolve(JSON.parse(response));
            }
        }));

// Get block by address
exports.getBlocksByAddress = walletAddress =>
    new Promise((resolve, reject) => {
        let height = 0;
        let data = [];
        db.createReadStream()
            .on('data', block => {
                block = JSON.parse(block.value);
                if (block.body.address === walletAddress) {
                    data.push(block);
                }
                height++;
            })
            .on('error', error => reject('Unable to read data stream!', error))
            .on('close', () => resolve(data));
    });

exports.getBlockByHash = blockHash =>
    new Promise((resolve, reject) => {
        let height = 0;
        db.createReadStream()
            .on('data', block => {
                block = JSON.parse(block.value);
                if (block.hash === blockHash) {
                    resolve(block);
                }
                height++;
            })
            .on('error', error => reject('Unable to read data stream!', error))
            .on('close', () => reject('Not found'));
    });
