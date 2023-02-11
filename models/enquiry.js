const express = require('express');
const router = express.Router();
const db = require('../db/db_connection');
const utils = require("../util");
module.exports = router;

const transformMap = new Map([
    ['name', 'name'],
    ['company_name', 'companyName'],
    ['contact', 'contact'],
    ['details', 'details'],
    ['email_id', 'emailId'],
    ['product_details', 'productDetails'],
    ['date', 'sysDate']
]);

let model = {
    get: (callback) => {
        db.query("SELECT * FROM `enquiry`",
        (error, data, fields) => {
            console.log(data);
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
    },
    add: (input, callback) => {
        let data = {
            name: input.name,
            company_name: input.company,
            contact: input.contactNumber,
            details: input.details,
            email_id: input.emailId,
            product_details: input.productDetails,
            date: new Date()
        }
        return db.query("insert into enquiry set ?",[data], callback)
    }
}

module.exports = model;