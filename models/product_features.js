const utils = require("../util");
const mysqlConnection = require('../db/db_connection');

const featuresMap = new Map([
    ['id', 'id'],
    ['details', 'details'],
    ['product_id','productId']
]);
const query = `SELECT * FROM product_features`;
const features = {
    get: (callback) => {
        mysqlConnection.query(query,
        (error, data, fields) => {
           if(!error) {
                const result = [];
                data.forEach((o) => {
                    result.push(utils.transformKeys(featuresMap, o));
                });
                callback({result});
           } else {
                console.log(error);
                callback({error});
           }
        })
    },
    add: (input, callback) => {
        let data = {
            product_id: input.productId,
            details: input.details
        }
        return mysqlConnection.query("insert into product_features set ?",[data], callback)
    }
}

module.exports = features;