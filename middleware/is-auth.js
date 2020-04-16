module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) {//the user is not logged in
        return res.redirect('/login');
    }
    next();
}