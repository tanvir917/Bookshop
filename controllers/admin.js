const Product = require('../models/product');// import class

const {validationResult} = require('express-validator/check')

exports.getAddProduct = (req, res, next)=>{
    res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationError: []
    });
};

exports.postAddProduct = (req, res, next)=>{
    //products.push({ title: req.body.title1 });//when added a model
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image);
    
    if (!image) {
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
          hasError: true,
          product: {
            title: title,
            price: price,
            description: description
          },
          errorMessage: 'Attached file is not an image.',
          validationError: []
        });
      }

      const imageUrl = image.path;

    const errors = validationResult(req);

    if(!errors.isEmpty()){//has error
        console.log(errors.array());
        
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationError: errors.array()
        });
    }

    const product = new Product({
        title: title, 
        price: price,
        imageUrl: imageUrl,  
        description: description,
        userId: req.user
    });
    product.save()
    .then(result => {
        console.log('Created Product');
        res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        //res.redirect('/500')
        /*return res.status(500).render('admin/edit-product', {
            pageTitle: 'Add Product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: 'Database operation failed, please try again',
            validationError: []
        });*/
    });
};



exports.getEditProduct = (req, res, next)=>{
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    //console.log('prodId from edit products: '+prodId);

    Product.findById(prodId)
    //Product.findByPk(prodId)
    .then(product => {
        //const product = products[0];
        if(!product){
            return redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product',
            editing: editMode,
            hasError: false,
            product: product,
            errorMessage: null,
            validationError: []
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    console.log('from admin product id: '+prodId);
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);

    if(!errors.isEmpty()){//has error
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationError: errors.array()
        });
    }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save()
        .then(result => {
            console.log('Updated Product');
            res.redirect('/admin/products');
        });
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getProducts = (req, res, next) => {
    //Product.findAll()
    Product.find({userId: req.user._id})
    //.select('title price -_id')
    //.populate('userId', 'name')
    .populate('userId')
    .then(products =>{
        res.render('admin/products', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/products'
            //hasProducts: products.length > 0,
            //activeShop: true
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};


exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
            console.log('Destroyed Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        });
}
