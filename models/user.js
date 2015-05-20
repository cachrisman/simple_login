var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    email: String,
    passwordDigest: String
});

// SIGN UP

// createSecure take a email and password in params
userSchema.statics.createSecure = function(email, password, cb) {
    // saves the user email and hashes the password
    var that = this;
    this.findOne({
        email: email
    }, function(err, user) {
        if (user) {
            cb("User already registered");
        } else {
            bcrypt.genSalt(function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    that.create({
                        email: email,
                        passwordDigest: hash
                    }, cb);
                });
            });
        }
    });
};

//SIGN IN
userSchema.statics.authenticate = function(email, password, cb) {
    this.findOne({
            email: email
        },
        function(err, user) {
            if (user.checkPassword(password)) cb(null, user);
            else cb("login failed\n");
        });
};

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;
