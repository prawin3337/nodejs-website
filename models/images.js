const utils = require("../util");
const mysqlConnection = require('../db/db_connection');

const images = {
    get: (callback) => {
        mysqlConnection.query("select * from images",
            (error, data, fields) => {
               if(!error) {
                    callback({data});
               } else {
                    console.log(error);
                    callback({error});
               }
            })
    },
    add: (input, callback) => {
        let data = {
            name: input.name,
            type: input.type
        }
        return mysqlConnection.query("insert into images set ?",[data], callback)
    }
}

module.exports = images;