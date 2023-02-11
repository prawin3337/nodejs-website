const express = require('express');
const router = express.Router();
const enquiryModel = require('../../models/enquiry');

router.get('/', (req, res) => {
    enquiryModel.get(({error, data}) => {
        if(error) {
            res.status(500).json({
                message: "There are some error with query.",
                data: [error]
            })
        } else {
            res.status(200).json({
                status: true,
                message:"Enquiry list fetched.",
                data
            });
        }
    });
})

module.exports = router;