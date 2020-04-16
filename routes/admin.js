const path = require('path');
const express = require('express');
//var bodyParser = require('body-parser')

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

///admin/add-product=>GET
router.get('/add-product', isAuth, adminController.getAddProduct);
    //console.log('In get middleware!');
    //sending response
    //res.sendFile(path.join(__dirname,'../','views','add-product.html'));

// /admin/add-product=>POST
router.post('/add-product', isAuth, adminController.postAddProduct)

// /admin/products
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

//exports.routes = router;
//exports.products = products; 
module.exports = router;