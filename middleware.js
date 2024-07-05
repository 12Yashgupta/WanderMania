let Listing=require("./models/listing");
const Review = require("./models/review");
module.exports.logedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
        {
            req.session.redirectUrl=req.originalUrl;
            req.flash("error","User must be loged-in !");
        return  res.redirect("/login")
        }
        next();
};

module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
         res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};
module.exports.checkListAuthorization=async (req,res,next)=>{
   
    let listing =await Listing.findById(req.params.id);
    console.log(listing);
    console.log(res.locals.currUser._id);
     if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","You are not owner of listings");
    return  res.redirect(`/listings/${req.params.id}`)
     }
 
    next();
};
module.exports.checkReviewAuthorization=async (req,res,next)=>{
     let{id,reviewId}=req.params;
    let review =await Review.findById(reviewId);
    console.log(review);
    console.log(res.locals.currUser._id);
     if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash("error","You are not author of this review!");
    return  res.redirect(`/listings/${id}`)
     }
 
    next();
};