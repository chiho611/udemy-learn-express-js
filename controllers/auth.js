const User = require("../models/user");
const bcrypt = require('bcryptjs')
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;

    User.findOne({email})
        .then(user => {

            if (!user) {
                req.flash('error', 'Invalid Email!')
                res.redirect('/login')
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user
                        return req.session.save(err => {
                            return res.redirect('/')
                        })
                    }
                    return res.redirect('/login')
                })
        })
        .catch(err => {
            console.log(err)
            return res.redirect('/login')

        })
}

exports.postLogout = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    req.session.destroy(err => {
        // console.log(err)
        res.redirect('/')
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postSignup = (req, res, next) => {
    const {email, password, confirmPassword} = req.body;
    User.findOne({email})
        .then(user => {
            if (user) {
                req.flash('error', 'E-Mail exists already, please pick a different one.');
                return res.redirect('/signup');
            }

            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {items: []}
                    });
                    return user.save();
                }).then(result => {
                    res.redirect('/login')
                })

        })
        .catch(err => {
            console.log(err);
        });

};
