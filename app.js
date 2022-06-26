var express = require("express");
var passport = require("passport")
,mongoose = require("mongoose")
,User = require("./models/User")
,bodyParser = require("body-parser")
,localStrategy = require("passport-local")
,methodOverride = require("method-override")
,flash = require("connect-flash")
,middleware = require("./middleware/index");

var functions = require("./routes/functions"),
    take = require("./routes/take"),
    watchWearHouse = require("./routes/watchWearHouse"),
    history = require("./routes/history"),
    shoppingCart = require("./routes/shoppingCart"),
    userHandle = require("./routes/userHandle");


var app = express();

var url = process.env.DATABASEURL || "mongodb://localhost:27017/wearhouse116V4"
mongoose.connect(url ,{useNewUrlParser:true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "****",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/",middleware.isLoggedIn,function(res,req){
    req.render("home");
});




app.use("/functions",functions);
app.use("/userHandle",userHandle);
app.use("/functions/",take);
app.use("/functions/",watchWearHouse);
app.use("/functions/",history);
app.use("/shoppingCart/",shoppingCart);

var port = process.env.PORT || 3000;
app.listen(port,function(){
    console.log("server has started");
});