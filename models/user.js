var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    email: String,
    passwordDigest: String
});

userSchema.statics.createSecure = function(params, cb) {
    var that = this;
    bcrypt.genSalt(function(err, salt) {
        bcrypt.hash(params.password, salt, function(err, hash) {
            console.log(hash);
            that.create({
                email: params.email,
                passwordDigest: hash
            }, cb);
        });
    });
};

userSchema.statics.encryptPassword = function(password) {
    var hash = bcrypt.hashSync(password, salt);
    return hash;
};


userSchema.statics.authenticate = function(email, password, cb) {
    this.find({
            email: email
        },
        function(err, user) {
            if (user === null) {
                throw new Error("Username does not exist");
            } else if (user.checkPassword(password)) {
                cb(null, user);
            }

        });
};

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;
