var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index.js");



//INDEX - show all campgrounds
router.get("/campgrounds", function (req, res) {
    if(req.query.search){
        const regex =  new RegExp(escapeRegex(req.query.search), 'gi');
        //Get all serach campGrounds from DB
    Campground.find({name: regex},(err, allCampgrounds)=> {
        if (err) {
            console.log(err)
        } else {
            if(allCampgrounds.length === 0){
                req.flash("error", "No Matched Campground !! Please Try again");
                return res.redirect("/campgrounds");
            }
            res.render("campgrounds/index", { campgrounds: allCampgrounds});
        }
    });
    }else{
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err)
            } else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds"});
            }
        }); 
    }
});

//CREATE - add new campground to DB
router.post("/campgrounds",middleware.isLoggedIn, function (req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    var newCampground = { name: name, image: image,price:price, description: desc,author: author }

    //create a new campGround and save to DB
    Campground.create(newCampground, function (err, newCampground) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newCampground)
            res.redirect("/campgrounds");
        }
    })
});

//NEW - show form to create campground
router.get("/campgrounds/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/newCampgrounds");
});

//SHOW - show more info about one campground
router.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/showMore", { campground: foundCampground });
        }
    })
});

//Edit Campground route
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership, function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
             res.render("campgrounds/edit", {campground: foundCampground});
                
    });
});

//Update Campground route
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership ,function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res. redirect("/campgrounds");
        }else{
            // ridirect somewhere(show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Destroy Campground Router
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;