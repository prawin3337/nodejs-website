const express = require('express');
const router = express.Router();
const productModel = require('../../models/product');
const featuresModel = require('../../models/product_features');
const imageModel = require("../../models/product_images");

router.post('/', (req, res) => {
    addProduct(req.body, (error, result) => {
        if (error) {
            let errorStr = JSON.stringify(error);
            res.status(500).json({
                message: "There are some error with query.",
                data: [{error: errorStr}]
            })
        } else {
            res.status(200).json({
                status: true,
                message:"Product successfully added.",
                data: result
            });
        }
    });
});

router.get('/', (req, res) => {
    productModel.get(({error, result}) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            res.status(200).json({
                status: true,
                message:"Product fetched.",
                data: result
            });
        }
    });
});

router.put('/', (req, res) => {
    productModel.delete({productId: req.body.productId}, (error, result, fields) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            addProduct(req.body, (error, result) => {
                if (error) {
                    let errorStr = JSON.stringify(error);
                    res.status(500).json({
                        message: "There are some error with query.",
                        data: [{error: errorStr}]
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message:"Product successfully updated.",
                        data: result
                    });
                }
            });
        }
    })
})

router.delete("/", (req, res) => {
    productModel.delete({productId: req.body.productId}, (error, result, fields) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            res.status(200).json({
                status: true,
                message:"Product deleted.",
                data: result
            });
        }
    })
});

function addProduct(data, callback) {
    productModel.add(data, (error, result, fields) => {
        if(error) {
            callback(error, result);
            return;
        }
        
        //JSON.stringify at FE
        const features = data.features
                        ? JSON.parse(JSON.stringify(data.features)) : [];
        const promises = addProductFeatures(result.insertId, features);

        const images = data.images ? data.images : [];
        promises.push(...addProductImages(result.insertId, images));

        Promise.all(promises).then(() => {
            callback(error, result);
        }).catch((err) => {
            callback(err, result);
        });  
    });
}

function addProductFeatures(productId, features) {
    let promises = [];
    features.forEach((feature) => {
        const data = {productId, details: feature.details};
        promises.push(
            new Promise((resolve, reject) => {
                featuresModel.add(data, (error, result) => {
                    if(error) {
                        reject({message:"Feature is not added", error});
                    } else {
                        resolve(result);
                    }
                });
            })
        );
    });
    return promises;
}

function addProductImages(productId, images) {
    let promises = [];
    images.forEach(({id}) => {
        const data = {productId, imageId: id};
        promises.push(
            new Promise((resolve, reject) => {
                imageModel.add(data, (error, result) => {
                    if(error) {
                        reject({message:"Image is not added", error});
                    } else {
                        resolve(result);
                    }
                });
            })
        );
    });
    return promises;
}
module.exports = router;