var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user")   
    seedDB = require("./seeds") 

//requiring routes
var commentRoutes       = require("./routes/comment"),
    campgroundRoutes    = require("./routes/campground"),
    indexRoutes         = require("./routes/index")


mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });

process.env.databaseURL 
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seed the database
//seedDB();

app.locals.moment =  require('moment');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "The thin line between love and hate !",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middle ware
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});