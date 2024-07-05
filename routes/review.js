const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("../models/listing.js")
let asyncWrap=require("../utils/asyncWrap.js");
let expressError=require("../utils/expressError.js");
let Review=require("../models/review.js");
let {review_Schema}=require("../schema.js");
let{logedIn,checkReviewAuthorization}=require("../middleware.js");
let reviewController=require("../controllers/reviews.js");
const validateReview=(req,res,next)=>{
    let{error}=review_Schema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }
    else
    next();
};
//Post review route
router.post("/",logedIn,validateReview,asyncWrap(reviewController.postReview));

//Delete review route
router.delete("/:reviewId",checkReviewAuthorization,
        logedIn,
        asyncWrap(reviewController.deleteReview));


module.exports=router;