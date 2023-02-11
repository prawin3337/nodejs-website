const utils = require("../util");
const mysqlConnection = require('../db/db_connection');

const transformMap = new Map([
    ['id', 'categoryId'],
    ['name', 'categoryName'],
    ['meta_keywords', 'metaKeywords'],
    ['date', 'date'],
    ['disabled', 'disabled']
]);

const category = {
    get: (callback) => {
        mysqlConnection.query("select * from category",
        (error, data, fields) => {
           if(!error) {
                const result = [];
                data.forEach((o) => {
                    result.push(utils.transformKeys(transformMap, o));
                });
                callback({data: result});
           } else {
                console.log(error);
                callback({error});
           }
        })
    }
}

module.exports = category;