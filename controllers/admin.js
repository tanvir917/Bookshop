const Product = require('../models/product');// import class


exports.getAddProduct = (req, res, next)=>{
    res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false, 
    isAuthenticated: req.session.isLoggedIn
    });
};

exports.postAddProduct = (req, res, next)=>{
    //products.push({ title: req.body.title1 });//when added a model
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
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
        console.log(err);
    });
};



exports.getEditProduct = (req, res, next)=>{
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    console.log('prodId from edit products: '+prodId);

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
            product: product, 
            isAuthenticated: req.session.isLoggedIn
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    console.log('from admin product id: '+prodId);
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

   
    Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save();
    })
    .then(result => {
        console.log('Updated Product');
        res.redirect('/admin/products');
    })
    .catch(err=>{
        console.log(err);
        
    });
};

exports.getProducts = (req, res, next) => {
    //Product.findAll()
    Product.find()
    //.select('title price -_id')
    //.populate('userId', 'name')
    .populate('userId')
    .then(products =>{
        res.render('admin/products', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/products', 
            isAuthenticated: req.session.isLoggedIn
            //hasProducts: products.length > 0,
            //activeShop: true
        });
    }).catch(err => {
        console.log(err); 
    });
};


exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
        .then(() => {
            console.log('Destroyed Product');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}
