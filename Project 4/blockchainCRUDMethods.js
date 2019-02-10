const level = require('level');
const chainDB = '../chaindata';
const db = level(chainDB);
const validation = './validation';
const validationDB = level(chainDB);

// Add data to levelDB with key/value pair
addLevelDBData = (key, data) => new Promise((resolve, reject) =>
    db.put(key, data, error => {
        if (error) {
            reject('Block ' + key + ' submission failed', error);
        } else {
            resolve(data);
        }
    }));

// Get data from levelDB with key
exports.getLevelDBData = key => new Promise((resolve, reject) =>
    db.get(key, (error, response) => {
        if (error) {
            reject('Not found!', error);
        } else {
            resolve(JSON.parse(response));
        }
    }));

// Add data to levelDB with value
exports.addDataToLevelDB = data => new Promise((resolve, reject) => {
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
exports.getBlock = blockHeight => new Promise((resolve, reject) =>
    db.get(blockHeight, (err, value) => {
        if (err) {
            reject('Not found!', err);
        } else {
            resolve(JSON.parse(value));
        }
    }));

// Add data to levelDB with key/value pair
exports.addLevelValidationDBData = function (key, data) {
    return new Promise(function (resolve, reject) {
        validationDB.put(key, data, function (error) {
            if (error) {
                reject('Block ' + key + ' submission failed', error);
            } else {
                resolve(data);
            }
        });
    });
};

// Get data from levelDB with key
exports.getLevelValidationDBData = function (key) {
    return new Promise(function (resolve, reject) {
        validationDB.get(key, function (error, response) {
            if (error) {
                reject('Not found!', error);
            } else {
                resolve(JSON.parse(response));
            }
        });
    });
};
