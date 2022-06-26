var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var Product = require("../models/Product");
var History = require("../models/History");
const User = require("../models/User.js");


/*
Render the take page
*/
router.get("/take",middleware.isLoggedIn,function(req,res){
    res.render("functions/take");
 });
 
router.post("/take",middleware.isLoggedIn,function(req,res){
   Product.findOne({"barcode_id":req.body.product.barcode_id},function(error,foundProduct){
      User.findById(req.user._id,function(err,foundUser){
         if( !foundUser || !foundProduct || Number(foundProduct.quantity) <= 0 || Number(foundUser.money) < Number(foundProduct.price)){
            req.flash("error","אירעה שגיאה, אנא בדוק את כמות הכסף בחשבון או אם המוצר קיים");
            return res.redirect("/functions/take");
         }else{

            //logging the item to the log file
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            History.create({username:foundUser.username,date:date,productName:foundProduct.name,quantity:1},function(err,log){
               if(err){
                   console.log(err.message);
                   req.flash("error",err.message);
                   return res.redirect("/");
               }
               log.save();
               console.log(log);
           });

            foundProduct.quantity--; //deacresing the quantity
            foundUser.money-=foundProduct.price; // charging the user
            foundProduct.save(); //saving the product
            foundUser.save(); //saving the user
            req.flash("success","הפעולה התבצעה בהצלחה");
            return res.redirect("/functions/take");
         }
      });
   });
});
module.exports = router;