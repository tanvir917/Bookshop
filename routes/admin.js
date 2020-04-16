const path = require('path');
const express = require('express');
//var bodyParser = require('body-parser')

const adminController = require('../controllers/admin');

const router = express.Router();

// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

///admin/add-product=>GET
router.get('/add-product', adminController.getAddProduct);
    //console.log('In get middleware!');
    //sending response
    //res.sendFile(path.join(__dirname,'../','views','add-product.html'));

// /admin/add-product=>POST
router.post('/add-product',adminController.postAddProduct)

// /admin/products
router.get('/products', adminController.getProducts);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

//exports.routes = router;
//exports.products = products; 
module.exports = router;