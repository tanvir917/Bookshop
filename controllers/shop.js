//const products = [];//get rid of when added a model
const Product = require('../models/product');// import class
//const Cart = require('../models/cart');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ITEMS_PER_PAGE = 2;

//from shop.js
exports.getProducts = (req, res, next)=>{
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
    .count()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find()
        .skip((page-1)* ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};



exports.getProduct = (req, res, next) => {
    //we can access productId because it is defined in shop.js route after the colon
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then( product =>{
            res.render('shop/product-details', {
                // js object
                // key is accessible fro the view 'key: value'
                product: product,
                pageTitle: product.title,
                path: '/products'//to determine which path is active
            });
    })
        .catch(err => {
            const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        });
};

exports.getIndex = (req, res, next)=>{
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
    .count()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find()
        .skip((page-1)* ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products =>{
        res.render('shop/index', {
            prods: products, 
            pageTitle: 'Shop', 
            path: '/',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {      
        //console.log(user.cart.items);
        const products =user.cart.items;
        res.render('shop/cart',{
            pageTitle: 'Your Cart',
            path: '/cart',
            products: products
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    /*Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for(product of products){
                const cartProductData = cart.products.find(
                    prod => prod.id === product.id);
                if(cartProductData){
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart',{
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        })
    });*/  
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    const product = req.body.productId;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        console.log(result);
        res.redirect('/cart')
    })

    /*let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: prodId}});
    })
    .then(products => {
        let product;
        if(products.length > 0){
            product = products[0]
        }
        
        if (product){
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product;
        }
        return Product.findByPk(prodId)
            
    })
    .then(product => {
        return fetchedCart.addProduct(product, {
            through: {quantity: newQuantity}
        });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));*/

    /*//productId is received from add-to-cart hidden input
    const prodId = req.body.productId;
    //console.log(prodId);
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
    })
    res.redirect('/cart');*/
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {      
        //console.log(user.cart.items);
        const products =user.cart.items.map(i => {
            return {quantity: i.quantity, product: { ...i.productId } }
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save()
    })
    .then(result => {
        return req.user.clearCart();
    })
    .then(() => {
        res.redirect('/orders');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then(orders => {            
            res.render('shop/orders',{
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
        if(!order){
            return next(new Error('No order found.'));
        }
        //logged in user
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorised user'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

        pdfDoc.pipe(fs.createWriteStream(invoicePath));//file will be saved
        pdfDoc.pipe(res);//output into res //res will be saved

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDoc.text('---------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price
            pdfDoc.fontSize(14).text(
                prod.product.title + 
                ' - ' + 
                prod.quantity+ 
                ' x ' + '$' + 
                prod.product.price );
        })
        pdfDoc.text('---------');
        pdfDoc.fontSize(14).text('Total Price: ' + '$' + totalPrice);

        pdfDoc.end();

        /*fs.readFile(invoicePath, (err, data) => {
            if(err) {
                return next(err);
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            res.send(data);
        })*/
        //const file = fs.createReadStream(invoicePath);
        //file.pipe(res);

    }).catch(err => {
        console.log(err);
    })
   
};

/*exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};*/

