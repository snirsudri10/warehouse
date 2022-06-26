var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var History = require("../models/History");

router.get("/history",middleware.isUserAndManager,function(req,res){
    History.find({},function(err,logs){ //showing all the logs
        if(err){
            console.log(err.message);
            req.flash("error",err.message);
            return res.redirect();
        }
        return res.render("functions/history",{logs:logs});
    });
});

//TODO add a remove function of logs
router.delete("/history/delete/:id",middleware.isUserAndManager,function(req,res){
    History.findByIdAndDelete(req.params.id,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("/");
        }
        req.flash("success","הרשומה נמחקה בהצלחה");
        res.redirect("/functions/history");
    })
});


module.exports = router;
