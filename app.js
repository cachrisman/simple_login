var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
    session = require("express-session"),
    path = require('path'),
    flash = require('connect-flash'),
    app = express();

// var views = path.join(process.cwd(), "public/views");
app.set('views', __dirname + '/public/views');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.set('view engine', 'ejs');

app.use(express.static("bower_components"));
app.use(express.static("public"));

app.use("/", function(req, res, next) {

    req.login = function(user) {
        req.session.userId = user.id;
    };

    req.currentUser = function(cb) {
        db.User.findById(req.session.userId,
            function(err, user) {
                req.user = user;
                cb(null, user);
            });
    };

    req.logout = function() {
        req.session.userId = null;
        req.user = null;
    };

    next();
});

app.get("/", function(req, res) {
    req.flash('info', "This is a flash message");
    res.render('index', {
        info: req.flash('info')
    });
    // res.sendFile(path.join(views, "index.html"));
});

app.get("/register", function(req, res) {
    res.render('register', {
        error: req.flash('error')
    });
    // res.sendFile(path.join(views, "register.html"));
});

// where users will POST data to create an account
app.post("/users", function(req, res) {
    // grab the user from the params
    var newUser = req.body.user;

    // create the new user
    db.User.createSecure(newUser.email, newUser.password,
        function(err, user) {
            if (err) {
                req.flash('error', err);
                res.redirect('/register');
            } else {
                req.login(user);
                req.flash('success', "User " + user.email + " successfully registered");
                res.redirect("/profile"); // redirect to user profile
            }
        });
});

app.get("/login", function(req, res) {
    res.render('login', {
        error: req.flash('error')
    });
    // res.sendFile(path.join(views, "login.html"));
});

app.post("/login", function(req, res) {
    var user = req.body.user;

    db.User.authenticate(user.email, user.password,
        function(err, user) {
            if (err) {
                req.flash('error', err);
                res.redirect('/login');
            } else {
                req.login(user);
                req.flash('success', "User " + user.email + " successfully logged in");
                res.redirect("/profile"); // redirect to user profile
            }
        });
});

app.get("/profile", function(req, res) {
    req.currentUser(function(err, user) {
        if (user) {
            res.render('profile', {
                success: req.flash('success'),
                user: user.email
            });
        } else {
            req.flash('error', "Only logged in users can see their profile");
            res.redirect('/login');
        }
    });
});

app.listen(3000, function() {
    console.log("SERVER RUNNING");
});
