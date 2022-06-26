var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var Product = require("../models/Product")



router.get("/watchWearhouse",middleware.isLoggedIn,function(req,res){
    Product.find({},function(err,products){ //getting all the products
       if(err){
          console.log(err.message);
          return res.redirect("/");
       }
       
       res.render("functions/watchWearhouse",{products:products}); //rendering the page to show all the products
    });
});

router.delete("/watchWearhouse/delete/:itemId",middleware.isUserAndManager,function(req,res){
   Product.findByIdAndDelete(req.params.itemId,function(err){ // deleting a product
      if(err){
         req.flash("error",err.message);
         return res.redirect("/");
      }
   });
   res.redirect("/");
});

router.get("/watchWearhouse/missing",middleware.isUserAndManager,function(req,res){
   Product.find({},function(err,products){
      var arr = [];
      if(err){
         console.log(err.message);
         return res.redirect("/");
      }
      products.forEach(element => {
         if(element.quantity <= 5){
            arr.push(element);
         }
      });
      console.log("products are: "+ arr);
      res.render("functions/missing",{missing:arr});
   });
});




module.exports = router