var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    manager:Boolean,
    shoppingCart:[{
        productId:String,
        name:String,
        quantity:Number,
        price:Number
    }],
    money:Number
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);