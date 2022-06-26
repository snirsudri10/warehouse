var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var Product = require("../models/Product");
var User = require("../models/User");
var History = require("../models/History");


/*
this function is showng the shopping cart of the user
*/
router.get("/",middleware.isLoggedIn,function(req,res){
    User.findById(req.user._id).populate("products").exec(function(err,foundUser){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/");
        }
        if(foundUser){ //if we found the user
            //checking if the product has not deleted and still in the cart
            for(let i=0;i<foundUser.shoppingCart.length;i++){
                Product.findById(foundUser.shoppingCart[i].productId,function(err,foundItem){ //searching for the product
                    if(err){
                        req.flash("error",err.message);
                        return res.redirect("/");
                    }else if(foundItem === null){ //if the product does not exist
                        foundUser.shoppingCart.splice(i,1); //deleteing it from the array
                        foundUser.save(); //saving the new shopping cart
                    }
                });
            }
            res.render("shoppingCart/show",{user:foundUser});//rendering the form
        }
    });
});

//adding to the shopping cart of the user
router.post("/addToCart/:itemId",middleware.isLoggedIn,function(req,res){
    console.log(req.body.qunatity);
    User.findById(req.user._id,function(err,foundUser){ //searching for the user
        if(err){
            req.flash("error",err.message);
            return res.redirect("/");
        }
        Product.findById(req.params.itemId,function(err,foundItem){ //finding product
            if(err){
                req.flash("error");
                return res.redirect("/");
            }
            if(!foundItem){
                res.redirect("/");
            }
            var found=false;
            var i=0;
            if(foundItem.quantity<1){ //if the quantity of the product is less than 1 (equals to 0 or less)
                req.flash("error","המוצר נגמר במלאי");
                return res.redirect("/functions/watchWearhouse");
            }else{
                if(foundUser.shoppingCart.length > 0){ //if there are items in the cart
                    for ( i= 0; i < foundUser.shoppingCart.length; i++) { //trying to find if this is a new item in the shopping
                        console.log("foundUser.shoppingCart[i].name: " + foundUser.shoppingCart[i].name);
                        console.log("foundItem.name: " + foundItem.name);
                        if(foundUser.shoppingCart[i].name===foundItem.name){ //if it is a new item 
                            found = true;//setting found to true
                            break; //breaking the loop
                        }
                    }
                    if(found){ //if we found the existed item in the shopping cart
                        foundUser.shoppingCart[i].quantity+=Number(req.body.qunatity) //increasing the quantity 
                    }else{
                        foundUser.shoppingCart.push({productId:foundItem._id,name:foundItem.name,quantity:req.body.qunatity,price:foundItem.price}); //pusing the new item to the shopping cart
                    }
                }else{
                    foundUser.shoppingCart.push({productId:foundItem._id,name:foundItem.name,quantity:req.body.qunatity,price:foundItem.price}); //if the item has not benn found pusing it to the shopping cart
                }

            
                foundItem.quantity-=req.body.qunatity; //decreasing the quantity of the item from the 
                req.flash("success","המוצר נוסף בהצלחה"); 
                res.redirect("/functions/watchWearhouse"); 
                foundItem.save();
                foundUser.save();
            }
        });
    });
});


router.delete("/removeFromCart/:productName/:itemId",middleware.isLoggedIn,function(req,res){
    User.findById(req.user._id,function(err,foundUser){
        if(err){
            res.flash("error",err.message);
            return res.redirect("/");
        }
        var index = findProduct(foundUser.shoppingCart,req.params.productName); //finding the index of the wanted product
        if(index === -1){
            req.flash("error","המוצר לא נמצא או שהוא לא קיים");
            return res.redirect("/shoppingCart");
        }
        var quantityOfProduct = foundUser.shoppingCart[index].quantity; //saving the quantity into a varible (muxh easier than writing the whole line)
        if(quantityOfProduct<=1){ //if we removing the last item from the shopping cart
            foundUser.shoppingCart.splice(index,1); //removing it from the shopping cart of the user
        }else{
            foundUser.shoppingCart[index].quantity--; //deacresing the item from the shopping list
        }
        updateProduct(req.params.itemId); //updating the product
        foundUser.save(); //saving it into the DB
        res.redirect("/shoppingCart/");
    });
});

/*
this function is updating the product with quantity of +1
input: the item to update
output: redirection if error occured
*/
function updateProduct(itemId){
    Product.findById(itemId,function(err,foundProduct){
        if(err){
            req.flash("error",err.message);
            return res.redirect("/shoppingCart");
        }
        if(foundProduct){ //if we found a product
            foundProduct.quantity++;
            foundProduct.save();
        }
        
    });
}

/*
this function is finding a product by name in the given array
input: * the array to search in
       * the name to find
output: the index of the product if found
*/
function findProduct(array,nameToFind){
    for (let i = 0; i < array.length; i++) {
        if(array[i].name == nameToFind){
            return i;
        }
    }
    return -1;
}

router.post("/checkOut/:totalPrice",middleware.isLoggedIn,function(req,res){
    User.findById(req.user._id,function(err,foundUser){
        if(foundUser){ //if we found the user
            if(foundUser.money < Number(req.params.totalPrice)){ //if the user doesnt have enough money
                req.flash("error", "אין מספיק כסף");
                return res.redirect("/shoppingCart");
            }            
            logProducts(foundUser.shoppingCart,req.user.username); //logging the product
            foundUser.shoppingCart = []; //reseting the shopping cart
            foundUser.money-=Number(req.params.totalPrice); //charging the user
            foundUser.save(); //saving the user
            return res.redirect("/shoppingCart");
        }
    });
});

/*
this function is logging all the items inside the shopping cart
input: the shopping cart array, and the name of the user
output: none
*/
function logProducts(shoppingCart,username){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(); //saving the date
    for (let index = 0; index < shoppingCart.length; index++) { //all the items in the shopping cart

        History.create({username:username,date:date,productName:shoppingCart[index].name,quantity:shoppingCart[index].quantity},function(err,log){ //creating the log item
            if(err){
                console.log(err.message);
                req.flash("error",err.message);
                return res.redirect("/");
            }
            log.save(); //saving the log
            //console.log(log);
        });
    }
}



module.exports = router;