var express = require("express");
var router = express.Router();
var Campground = require("../models/campground")
var Comment = require("../models/comment")
var middleware = require("../middleware/index.js");

//========================
//COMMENTS ROUTES
//========================

//add new comments page
router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err)
        } else {
            res.render("comments/newComment", { campground: campground });
        }
    });
});

//post new comments created
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function (req, res) {
    //lookup campgrounds using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //create new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong !")
                    console.log(err);
                } else {
                    //add username and  id to comment and save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to campground and save
                    campground.comments.push(comment);
                    campground.save();
                    console.log(comment);
                    //ridirect campground show page
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//Comment edit
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership , function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    }); 
});

//Comment update
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

//Comments destroy
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req, res){
 Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

module.exports = router;