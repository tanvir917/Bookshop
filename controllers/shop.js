//const products = [];//get rid of when added a model
const Product = require('../models/product');// import class
//const Cart = require('../models/cart');
const Order = require('../models/order');

//from shop.js
exports.getProducts = (req, res, next)=>{
    Product.find().then(products =>{
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/products', 
            isAuthenticated: req.session.isLoggedIn
        });
    }).catch(err => {
        console.log(err); 
    });
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
                path: '/products',//to determine which path is active
                isAuthenticated: req.session.isLoggedIn
            });
    })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next)=>{
    Product.find().then(products =>{
        res.render('shop/index', {
            prods: products, 
            pageTitle: 'Shop', 
            path: '/'
        });
    }).catch(err => {
        console.log(err); 
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
            products: products, 
            isAuthenticated: req.session.isLoggedIn
        });
    }).catch(err => console.log(err));
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
        .catch(err => console.log(err));
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
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then(orders => {            
            res.render('shop/orders',{
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders, 
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => console.log(err));
};

/*exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};*/
