var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/simple_login");

module.exports.User = require("./user");
