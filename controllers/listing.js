let Listing=require("../models/listing.js");
let User=require("../models/user.js");
let Booking=require("../models/booking.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
//const mbxClient = require('@mapbox/mapbox-sdk'); 
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const express=require("express");
const app=express();
const path=require("path");
const { listingSchema } = require("../schema.js");
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
module.exports.index = async (req, res) => {
    let allListings = await Listing.find();
   // console.log(req.query)
    const {  minPrice, maxPrice, category } = req.query;

    let result = allListings;


    // If category parameter is provided, filter by category
    if (category && category.length > 0) {
        result = result.filter(listing => category.includes(listing.category));
    }

    // If minPrice or maxPrice parameters are provided, filter by price range
    if (minPrice || maxPrice) {
        const min = minPrice ? parseInt(minPrice) : Number.MIN_SAFE_INTEGER;
        const max = maxPrice ? parseInt(maxPrice) : Number.MAX_SAFE_INTEGER;

        result = result.filter(listing => listing.price >= min && listing.price <= max);
    }
    //console.log(result);

    res.render('listings/index.ejs', { allListings: result });
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
 };

 module.exports.showRoute=async (req,res)=>{
    let{id}=req.params;
    let list=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
   // console.log(list);
    if(!list)
        {
            req.flash("error","Listing you requested ,does not exist");
            res.redirect("/listings");
        }
   //    console.log(list);
    console.log("Show Route:-");
    console.log(list);
    res.render("listings/show1.ejs",{list});
}

module.exports.createNewListing=async (req,res,next)=>{
  let response= await geocodingClient.forwardGeocode({
       query: req.body.listing.location,
        limit:1
     })
     .send()
       console.log(response.body.features[0].geometry);
    // res.send("Added");
    if(!req.body.listing){
        throw new expressError(400,"Enter the valid data!");
    }
      let url=req.file.path;
      let filename=req.file.filename;
     let listing = await new Listing(req.body.listing);
     listing.owner=req.user._id;
     listing.image={url,filename};
      listing.geometry=response.body.features[0].geometry;
    console.log(req.user);
      
   let new_listing=  await listing.save();
   console.log(new_listing);
     req.flash("success","New Listings is created");
     res.redirect("/listings");
  //console.log(req.body);
  //res.send("Great ");
};

module.exports.editForm=async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested, does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateForm=async (req, res) => {
    const { id } = req.params;
    if (!req.body.listing) {
        throw new expressError(500, "Please input valid data");
    }
    
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !=="undefined")
        {
            listing.image.url=req.file.path;
            listing.image.filename=req.file.filename;
        }
        await listing.save();
        res.redirect(`/listings/${id}`);
};

module.exports.deleteForm=async (req,res)=>{
   let list_id=req.params.id;
    let listing=await Listing.findById(list_id).populate({path:"owner",populate:{path:"customers"}}).populate("bookings");
  
        for(book of listing.owner.customers)
            {
                let id=book._id;
                let book_place=await Booking.findById(id);   
                let ownerId=book_place.owner._id;
                let owner=await User.findById(ownerId);
                let placeId=book_place.place._id;
                let place=await Listing.findById(placeId); 
               let l= await Listing.findByIdAndUpdate(placeId,{$pull:{bookings:id}});
               let u= await User.findByIdAndUpdate(ownerId,{$pull:{bookings:id}});
               let b= await Booking.findByIdAndDelete(id);
          }
    let deletedListing=await Listing.findByIdAndDelete(list_id);
    console.log("Deleted listing",deletedListing);
    req.flash("success","Listing deleted!");
    res.redirect("/listings");
  
 };