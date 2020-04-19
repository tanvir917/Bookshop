const path = require('path');
const express = require('express');
//var bodyParser = require('body-parser')

const { body } = require('express-validator/check');

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
router.post('/add-product', 
[
    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min: 3, max: 400})
        .trim()
],
 isAuth, 
 adminController.postAddProduct)

// /admin/products
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
[
    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min: 3, max: 400})
        .trim()
],
 isAuth, 
 adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

//exports.routes = router;
//exports.products = products; 
module.exports = router;