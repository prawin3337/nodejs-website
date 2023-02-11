const utils = require("../util");
const mysqlConnection = require('../db/db_connection');

const productMap = new Map([
    ['id', 'productId'],
    ['name', 'productName'],
    ['meta_keywords', 'metaKeywords'],
    ['date', 'date'],
    ['descriptions', 'productDesc'],
    ['details', 'productDetails'],
    ['pages', 'pages'],
    ['category_id', 'categoryId'],
    ['category_name', 'categoryName']
]);
const query = `select product.id, product.name, product.descriptions, product.details,
product.date, product.price, product.pages, product.meta_keywords,category_id, category.name as category_name
from product,category
where product.category_id = category.id;`;

const deleteQuery = `DELETE FROM product WHERE id = ?;`;

const products = {
    get: (callback) => {
        mysqlConnection.query(query,
        (error, data, fields) => {
           if(!error) {
               let imagePromises = [];
                data.forEach((o) => {
                    let proObj = utils.transformKeys(productMap, o);
                    imagePromises.push(setProductImages(o.id, proObj));
                });

                Promise.all(imagePromises).then((data) => {
                    callback({result: data});
                });
           } else {
                console.log(error);
                callback({error});
           }
        })
    },
    add: (input, callback) => {
        let data = {
            name: input.name,
            meta_keywords: input.metaKeywords,
            descriptions: input.descriptions,
            details: input.details,
            category_id: input.categoryId,
            pages: input.pages,
            price: input.price,
            date: new Date()
        }
        return mysqlConnection.query("insert into product set ?",[data], callback)
    },
    delete: (input, callback) => {
        return mysqlConnection.query(deleteQuery, [input.productId], callback)
    }
}

function setProductImages(productId, productObj) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM images WHERE `id` IN (SELECT `image_id` FROM product_images where product_id=?)";
        mysqlConnection.query(query, [productId],
            (error, data, fields) => {
                if(!error) {
                    productObj["images"] = data;
                    setProductFeatures(productId, productObj)
                        .then((productObj) => {
                            resolve(productObj);
                        });
                } else {
                    reject(error);
                }
            })
        })
}

function setProductFeatures(productId, productObj) {
    return new Promise((resolve, reject) => {
        const query = "SELECT details FROM product_features where product_id=?";
        mysqlConnection.query(query, [productId],
            (error, data, fields) => {
                if(!error) {
                    productObj["features"] = data;
                    resolve(productObj);
                } else {
                    reject(error);
                }
            })
        })
}

module.exports = products;