const express = require('express');
const router = express.Router();
const model = require('../../models/category');

router.get('/', (req, res) => {
    model.get(({error, data}) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            res.status(200).json({
                status: true,
                message:"Category list fetched.",
                data
            });
        }
    });
})

module.exports = router;