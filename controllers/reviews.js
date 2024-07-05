let Listing=require("../models/listing.js");
let Review=require("../models/review.js");
module.exports.postReview=async (req,res)=>{
    let{id}=req.params;
    let newListing=await Listing.findById(id); 
    let newReview=new Review(req.body.review);
 //   console.log(newListing,newReview);
     newReview.author=req.user._id;
 //   let newReview2=await Listing.findById(id).populate("author"); 
   
    newListing.reviews.push(newReview);

    await newListing.save();
    await newReview.save();
    console.log(newListing);
    console.log(newReview);
    req.flash("success","Review Added!");
    res.redirect(`/listings/${id}`)
};

module.exports.deleteReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    console.log(req.params);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted!");
    res.redirect(`/listings/${id}`);

};