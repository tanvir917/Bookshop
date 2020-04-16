const express =require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
const User  = require('./models/user');

const app = express(); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');
app.set('views', 'views');//not necessary

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5e972ff927cc134f55b528c7')
        .then(user => {
            req.user = user; 
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes); 
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://tanvir:00000000@cluster0-bewo2.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user => {
            if(!user){
                const user = new User({
                    name: 'tanvir',
                    email: 'tanvir@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        
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


