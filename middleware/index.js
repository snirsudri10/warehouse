var middlewareObj ={}

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","עליך להיות מחובר");
    res.redirect("/userHandle/login");
}

middlewareObj.isUserAndManager = function(req,res,next){
    if( req.user && req.user.manager){
        return next();
    }
    req.flash("error","עליך להיות מנהל");
    res.redirect("/");
}
module.exports = middlewareObj