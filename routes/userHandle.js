var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/User");
var middleware = require("../middleware/index.js");

//middleware.isUserAndManager
router.get("/register",function(req,res) {
   res.render("userHandle/register"); //register show page
});

//middleware.isUserAndManager,
router.post("/register",function(req,res){
   var manager;
   if(req.body.manager){ 
      manager = true;
   }else{
      manager = false;
   }
   var newUser = new User({username:req.body.username,manager:manager,money:0}); //creating the user
   User.register(newUser,req.body.password,function(err,user){ //registering the user
      if(err){
         console.log(err.message);
         req.flash("error",err.message);
         return res.redirect("register");
      }
      passport.authenticate("local")(req,res,function(){ //authenticating the user using passport
         req.flash("success",req.user.username+", נרשמת בהצלחה")
         res.redirect("/");
      });
   });
});

router.get("/login",function(req,res) {
   res.render("userHandle/login"); //login page
});

router.post("/login",passport.authenticate("local",
    {successRedirect:"/", //if the login been successful 
     failureRedirect:"login"} //if the login failed
    ),function(req,res){
});

router.get("/logout",function(req,res){
   if(req.user){ //if there is a user connected
      req.flash("success","יצאת בהצלחה "+req.user.username); //showing a success message
      req.logOut(); //logging out
      res.redirect("/userHandle/login");
   }else{
      req.flash("error","משתמש לא קיים");
      res.redirect("/userHandle/login");
   }
});

//showing all the users
router.get("/showUsers",middleware.isUserAndManager,function(req,res){
   User.find({},function(err,foundUsers){ //seraching for all users
      if(err){
         req.flash("error",err.message);
         return res.redirect("/");
      }
      if(foundUsers==[]){ //if the array is empty (not supposed to happen)
         req.flash("error","לא נמצאו משתמשים");
         return res.redirect("/");
      }
      res.render("userHandle/showUsers",{users:foundUsers}); //rendering the handling user page
   });
});

router.get("/edit/:id",middleware.isUserAndManager,function(req,res){ //editing a specific user
   User.findById(req.params.id,function(err,foundUser){ //finding a specefic user
      if(err){
         console.log(err);
         req.flash("error","המשתמש לא נמצא או לא קיים");
         return res.redirect("/userHandle/showUsers");
      }
      res.render("userHandle/edit",{user:foundUser}); //dendering the editing page of the user
   });
});

router.put("/edit/:id",middleware.isUserAndManager,function(req,res){
   User.findByIdAndUpdate(req.params.id,req.body.user,function(err,updatedUser){ //finding a user and updating
      if(err){
         req.flash("error",err.message);
         return res.redirect("/userHandle/showUsers");
      }else{
         req.flash("success","משתמש עודכן בהצלחה");
         res.redirect("/userHandle/showUsers");
      }
   })
});

router.delete("/delete/:id",middleware.isUserAndManager,function(req,res){
   User.findById(req.params.id,function(err,foundUser){ //searching for the user
      if(err){
         req.flash("error",err.message);
         return res.redirect("/");
      }
      if(String(req.user._id)===String(foundUser._id)){ //user cannot delete it self
         req.flash("error","משתמש לא יכול למחוק את עצמו");
         return res.redirect("/");
      }else{
         User.findByIdAndRemove(req.params.id,function(err){ //deleteing a user if its not himself
            if(err){
               req.flash("error",err.message);
               res.redirect("/userHandle/showUsers");
            }else{
               req.flash("success","המשתמש נמחק בהצלחה");
               res.redirect("/");
            }
         });
      }
   });
});

module.exports = router