const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const _ = require("lodash");
const axios = require('axios').default;

// Initialise Express
const app = express();
const nodemailer = require('nodemailer');

const enquiryModel = require('./models/enquiry');

// app.locals.domain = 'http://www.localhost:3000';
app.locals.domain = 'http://www.pragatienter.com/web';
global.domain = app.locals.domain;

app.locals._ = _;

const category = require("./models/category");
const products = require("./models/product");
const productImages = require("./models/product_images");
const productFeatures = require("./models/product_features");

// Render static files
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public', {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', "http://localhost");
        res.setHeader('Access-Control-Allow-Origin', "http://localhost:4200");
        res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
        res.setHeader('Access-Control-Allow-Origin', "http://www.pragatienter.com:3000");
        res.setHeader('Access-Control-Allow-Origin', "http://pragatienter.com:3000");
        res.setHeader('Access-Control-Allow-Origin', "http://www.pragatienter.com/web");
        res.setHeader('Access-Control-Allow-Origin', "http://pragatienter.com");
    }
}));

app.use((req, res, next) => {

    // Website you wish to allow to connect
    var allowedOrigins = ['http://localhost:4200', 'http://localhost', 'http://www.pragatienter.com:3000', 'http://www.pragatienter.com', 'http://pragatienter.com', 'http://pragatienter.com:3000'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token, Content-Length, boundary, Access-Control-Allow-Origin');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// for parsing application/json
app.use(bodyParser.json({limit: "50mb"})); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
// app.use(upload.array()); 
app.use(express.static('public'));

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));
// Port website will run on
const port = 3000;
app.listen(port, () => {
    console.log("server port", port);
});

// *** GET Routes - display pages ***

//RI page
app.get('/v3',(req,res) => {  
    res.redirect('http://www.pragatienter.com/v3')
})

// Root Route
app.get('/', (req, res) => {
    Promise.all(getProductData()).then((values) => {
        const products = values[1].filter(({pages}) => pages.includes("home"));
        if(products) {
            res.render("index", {categorys: values[0], products});
        } else {
            res.redirect('/web/404');
        }
    });
});

app.get('/product/all-products', (req, res) => {
    let {categoryId, categoryName} = req.query;
    categoryName = categoryName || "All Products"
    Promise.all(getProductData()).then((values) => {
        let products = categoryId
                        ? values[1].filter((pro) => pro.categoryId == categoryId)
                        : values[1];
        if(products) {
            res.render('products/all-products',{products, categoryName});
        } else {
            res.redirect('/404');
        }
    });
});

app.get('/product/details', (req, res) => {
    Promise.all(getProductData()).then((values) => {
        const product = values[1].find(({productId}) => productId == req.query.productId);
        if(product) {
            res.render('products/product-detail', {product});
        } else {
            res.redirect('/web/404');
        }
    });
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/enquiry', (req, res) => {
    const {categoryName, productName, productImage, productId, productDesc, metaKeywords} = req.query;
    res.render('products/product-enquiry', {categoryName, productName, productId, productImage, productDesc, metaKeywords});
});

app.post('/enquiry/request', (req, res) => {
    if(_.isEmpty(req.body["g-recaptcha-response"])) {
        sendEnquiryMail({mailTo: 'admin@pragatienter.com', mailCC: '', subject: 'Invalid enquiry', ...req.body}, () => {});
        
        res.status(400).json({
            message: "CAPTCHA validation error.",
            error: {},
            data: null
        });
    } else {
        validateCaptcha({
            secret: "6LdCxVQhAAAAAAde15aZzkErKYoyyeG_9043Cuef",
            response: req.body["g-recaptcha-response"]
        }, (validationRes) => {
            if(_.isEmpty(validationRes.error) && validationRes.success == true) {
                enquiryModel.add(req.body, (error, result, fields) => {
                    if (error) {
                        let errorStr = JSON.stringify(error);
                        res.status(500).json({
                            message: "There are some error with query.",
                            error: errorStr,
                            data: null
                        })
                    } else {
                        sendEnquiryMail(req.body, () => {
                            res.status(200).json({
                                status: true,
                                message:"Enquiry successfully sent.",
                                data: result
                            });
                        });
                    }
                });
            } else {
                sendEnquiryMail({mailTo: 'admin@pragatienter.com', mailCC: '', subject: 'Invalid enquiry', ...req.body}, () => {
                    res.status(400).json({
                        message: "Found invalid google CAPTCHA.",
                        error: validationRes['error-codes'],
                        data: null
                    });
                });
            }
        });
    }
});

// API section
var product = require('./api/routes/product');
var images = require('./api/routes/images');
var enquiry = require('./api/routes/enquiry');
var categoryApi = require('./api/routes/category');

app.use('/api/product', product);
app.use('/api/images', images);
app.use('/api/enquiry', enquiry);
app.use("/api/category", categoryApi);

app.get('/404', (req, res) => {
    res.render('404');
});

app.all('*', (req, res) => {
    res.redirect('/web/404');
});

const getProductData = () => {
    return [
        new Promise((resolve, reject) => {
            category.get((response) => {
                if(!response.error) {
                    resolve(response.data);
                } else {
                    reject(response.error);
                }
            });
        }),
        new Promise((resolve, reject) => {
            products.get((response) => {
                if(!response.error) {
                    const products = response.result;
                    mapProductImages(products, (products) => {
                        mapProductFeatures(products, (products) => {
                            resolve(products);
                        });
                    });
                } else {
                    reject(response.error);
                }
            });
        })
    ]
}

const mapProductImages = (products, calback) => {
    productImages.get((response) => {
        products.forEach((product) => {
            const productImages = response.result
                                        .filter((image) => image.productId == product.productId)
                                        .map(({name}) => name);
            Object.assign(product, {productImages});
        });
        calback(products);
    });
}

const mapProductFeatures = (products, calback) => {
    productFeatures.get((response) => {
        
        products.forEach((product) => {
            const features = response.result
                                        .filter((feature) => feature.productId == product.productId)
                                        .map(({details}) => details);
            Object.assign(product, {features});
        });
        calback(products);
    });
}

const validateCaptcha = ({secret, response}, calback) => {
    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`)
      .then((response) => {
        calback(response.data);
      })
      .catch((error) => {
        calback(error);
      });
}

const sendEnquiryMail = (params, calback) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        secure: true,
        port: 465,
        auth: {
            user: 'admin@pragatienter.com',
            pass: "JtNTUCGwiX8E"
        }
    });

    const {mailTo = null, mailCC = null, subject = "Enquiry from website", name, emailId, contactNumber,
           company, details, productDetails} = params;
    const mailOptions = {
        from: 'admin@pragatienter.com',
        to: (mailTo != null) ? mailTo : 'sales@pragatienter.com',
        cc: (mailCC != null) ? mailCC : 'admin@pragatienter.com,pragatienterprises00@gmail.com',
        subject,
        html: `<html>
            <body>
                <table>
                    <tbody>
                        <tr>
                            <td>Name</td><td>${name}</td>
                        </tr>
                        <tr>
                            <td>Email</td><td>${emailId}</td>
                        </tr>
                        <tr>
                            <td>Contact Number</td><td>${contactNumber}</td>
                        </tr>
                        <tr>
                            <td>Company</td><td>${company}</td>
                        </tr>
                        <tr>
                            <td>Detals</td><td>${details}</td>
                        </tr>
                        <tr>
                            <td>Product</td><td>${productDetails}</td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            calback({error});
        } else {
            calback({error: false});
        }
    });
}
