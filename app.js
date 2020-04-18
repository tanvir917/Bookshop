const express =require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
const User  = require('./models/user');
const MONGODB_URL = 'mongodb+srv://tanvir:00000000@cluster0-bewo2.mongodb.net/shop';


const app = express(); 
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');//not necessary

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth'); 

//middlewares
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken =  req.csrfToken();
    next();
});

app.use((req, res, next) => {
    //throw new Error('Sync Dummy');
    if (!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            //throw new Error('Sync Dummy');
            if(!user){
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err)); 
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes); 
app.use(authRoutes);
app.get('/500', errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next) => {
    //res.redirect('500');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500', 
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose
    .connect(MONGODB_URL)
    .then(result => {
      app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });




/*const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');*/

/*Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order)

Order.belongsToMany(Product, {through: OrderItem})

sequelize
    //.sync({force: true})//to overwrite a table
    .sync()
    .then(result => {
        return User.findByPk(1);
    //console.log(result);
    })
    .then(user => {
        if(!user){
            return User.create({name: 'Max', email: 'test@test.com'});
        }
        return user;
    })
    .then(user => {
        //console.log(user);
        return user.createCart();
        
    })
    .then(cart =>{
        app.listen(3000);
    })
    .catch(err => {
    console.log(err);
    })*/


