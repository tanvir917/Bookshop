const User = require('../models/user');

const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn);
    //const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true';
    //console.log(req.get('Cookie').trim().split('=')[1]);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login', 
        isAuthenticated: false
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup', 
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
        .then(user => {
            if(!user) {//didnt find user
                return res.redirect('/login');
            }
            //if user find
            bcrypt.compare(password, user.password)
            .then(doMatch => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    //res.redirect('/');
                    //to be sure session was created before you redirect
                    return req.session.save(err => {//return to not execute login page
                        console.log(err);
                        res.redirect('/');
                    });
                }
                res.redirect('/login');//invalid password
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login')
            });
            
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email: email})
    .then(userDoc => {
        if(userDoc){
            return res.redirect('/signup');
        }
        //asynchronous task and gives us back a promise so do return
        return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        });  
    })
    .catch(err => {
        console.log(err);   
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};