const User = require('../models/user');

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

exports.postLogin = (req, res, next) => {
    User.findById('5e972ff927cc134f55b528c7')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            //res.redirect('/');
            //to be sure session was created before you redirect
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};