const utils = require("../util");
const mysqlConnection = require('../db/db_connection');

const imageMap = new Map([
    ['product_id', 'productId'],
    ['name', 'name'],
    ['image_id', 'imageId']
]);
const query = `SELECT product_images.product_id, product_images.image_id, images.name
FROM product_images,images
WHERE product_images.image_id = images.id`;
const productsImages = {
    get: (callback) => {
        mysqlConnection.query(query,
        (error, data, fields) => {
           if(!error) {
                const result = [];
                data.forEach((o) => {
                    result.push(utils.transformKeys(imageMap, o));
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
            image_id: input.imageId
        }
        return mysqlConnection.query("insert into product_images set ?",[data], callback)
    }
}

module.exports = productsImages;