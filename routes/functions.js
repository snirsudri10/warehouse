var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var Product = require("../models/Product")



router.get("/add",middleware.isUserAndManager,function(req,res) {
   res.render("functions/add"); //rendering the add form
});

router.get("/add/notExsited",middleware.isUserAndManager,function(req,res) {
   res.render("functions/addNotExsited");
});

router.post("/add",middleware.isUserAndManager,function(req,res,next){
   Product.findOne({"barcode_id":req.body.product.barcode_id},function(err,foundItem){  //finding one product by bracode
      if(err){ 
         req.flash("error",err.message);
         console.log(err.message);
         return res.redirect("/");
      }
      if(foundItem===null){
         //if the product not found sending a new form to add a new product
         return res.render("functions/addNotExsited",{barcode_id:{"code":req.body.product.barcode_id}});
      }else{
         //if the product sending the form to update it
         return res.render("functions/addExsited",{product:foundItem});
      }
   });

});

router.post("/addNotExsited",middleware.isUserAndManager,function(req,res){
   //console.log(req.body.product);
   var price = Number(req.body.product.price); 
   var quantity = Number(req.body.product.quantity);
   if(req.body.product.name === '' ||req.body.product.price === '' || req.body.product.quantity === '' || req.body.product.barcode_id === '' || price === NaN || quantity === NaN){
      req.flash("error","אחד מהנתונים ריק")
      console.log("one was empty!");
      return res.redirect("/");
   } //checking the price or the quantity that entered
   req.body.product.price = price; 
   req.body.product.quantity= quantity;
   var error = false;
   Product.create(req.body.product,function(err,product_item){ //creating a new product to the DB
      if(err){
         req.flash("error",err.message);
         console.log(err.message);
         error = true;
         return;
      }
      product_item.save(); //saving it into the DB
      console.log("saved!");
   });
   //console.log(product_item);
   if(!error){
      req.flash("success","המוצר נוצר בהצלחה"); //sending a success message to the user
   }else{
      req.flash("error","קיים כבר מוצר עם אותו השם") //sending a error message to the user
   }
   res.redirect("/"); //redirecting

});

router.put("/addExsited",middleware.isUserAndManager,function(req,res){
   console.log(req.body.product);
   var price = Number(req.body.product.price);
   var quantity = Number(req.body.product.quantity);
   if(req.body.product.name === '' ||req.body.product.price === '' || req.body.product.quantity === '' || req.body.product.barcode_id === '' || price === NaN || quantity === NaN){
      req.flash("error","אחד מהנתונים ריק");
      console.log("one was empty!");
      return res.redirect("/");
   } //checking for invalid data
   req.body.product.price = price;
   req.body.product.quantity = quantity;
   //updating the existed product
   Product.findOneAndUpdate({"barcode_id":req.body.product.barcode_id},req.body.product,function(err,foundProduct){
      if(err){
         console.log(err.message);
         req.flash("error",err.message);
         res.redirect("/fucntions/add");
      }else{
         req.flash("success","המוצר עודכן בהצלחה")
         res.redirect("/");
      }
   })
});

router.get("/remove",middleware.isUserAndManager,function(req,res){
   Product.find({},function(err,products){
      if(err){ 
         req.flash("error",err.message);
         console.log(err.message);
         return res.redirect("/");
      }
      res.render("functions/remove" ,{products:products});
   });
});


module.exports = router