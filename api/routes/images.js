const express = require('express');
const router = express.Router();
const imageModel = require('../../models/images');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);


router.get('/', (req, res) => {
    imageModel.get(({error, data}) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            data.forEach((img) => {
                img["path"] = domain+"/img/"+img.name;
            });

            res.status(200).json({
                status: true,
                message:"Image list fetched.",
                data
            });
        }
    });
})

var multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, appDir+'/public/img')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const dotIndex = file.originalname.lastIndexOf(".");
      const fileExtension = file.originalname.substring(dotIndex, file.originalname.length);
      cb(null, "upload" + file.fieldname + '-' + uniqueSuffix + '' + fileExtension)
    }
})

var upload = multer({ storage:storage }).single("image");
router.post('/', (req, res, next) => {
    upload(req, res, (err) => {
        if(err) {
            res.status(501).json({err});
        }

        const imgData = Object.assign(req.body, {name: req.file.filename});
        addDBImage(imgData).then((result) => {
            const data = Object.assign({}, imgData, result, {imageId: result.insertId, imageName: imgData.name})
            res.status(200).json({
                status: true,
                message:"Image successfully added.",
                data: data
            });
        }).catch((error) => {
            let errorStr = JSON.stringify(error);
            res.status(500).json({
                message: "There are some error with query.",
                data: [{error: errorStr}]
            })
        });
    });
    
});

var uploadMulti = multer({ storage:storage }).array('image', 5);
router.post('/multi', (req, res, next) => {
    uploadMulti(req, res, (err) => {
        if(err) {
            res.status(501).json({err});
        }
        
        addMultiImages(req).then((result) => {
            res.status(200).json({
                status: true,
                message:"Image successfully added.",
                data: result
            });
        }).catch(error => {
            res.status(500).json({
                status: false,
                message: "There are some error with query.",
                data: [{error}]
            })
        });
    });
});

function addMultiImages(req) {
    let promises = [];
    for(let img of req.files) {
        const imgData = Object.assign(req.body, {name: img.filename});
        promises.push(addDBImage(imgData));
    }
    return Promise.all(promises);
}

function addDBImage(data) {
    return new Promise((resolve, reject) => {
        imageModel.add(data, (error, result, fields) => {
            if(error)
                reject(error);
            else 
                resolve({result});
        });
    });
}

module.exports = router;