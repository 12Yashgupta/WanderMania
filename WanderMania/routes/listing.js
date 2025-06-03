const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js")
let Booking=require("../models/booking.js")

let User=require("../models/user.js");
let {listingSchema}=require("../schema.js");
let asyncWrap=require("../utils/asyncWrap.js");
let expressError=require("../utils/expressError.js");
let {logedIn,checkListAuthorization,isReviewAuthor,isOwner}=require("../middleware.js");
let listingController=require("../controllers/listing.js");
const multer  = require('multer')
const {storage}=require("../clouconfig.js");
const upload = multer({storage})
const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }
    else
    next();
};

router.get('/wishlist', logedIn, async (req, res) => {
     const user = await User.findById(req.user._id).populate('wishlist');
     res.render('users/wishlist', { wishlist: user.wishlist });
    // res.send("Your wishlist")
   });
   router.get(
    "/search",
    asyncWrap(async (req, res) => {
      const term = (req.query.title || "").trim();
  
      // 1) Empty search term → flash & redirect
      if (!term) {
        req.flash("error", "Please enter a keyword to search");
        return res.redirect("/listings");
      }
  
      // 2) Perform case-insensitive search
      const listings = await Listing.find({
        title: { $regex: term, $options: "i" },
      });
  
      // 3) No matches → flash & redirect
      if (listings.length === 0) {
        req.flash("error", `No listings found for “${term}.”`);
        return res.redirect("/listings");
      }
  
      // 4) Matches found → prepare an immediate success message
      const successMsgs = [
        `🎉 Found ${listings.length} propert${
          listings.length > 1 ? "ies" : "y"
        } matching “${term}.”`,
      ];
      const errorMsgs = req.flash("error"); // just in case
  
      // 5) Render results with messages
      res.render("listings/index.ejs", {
        allListings: listings,
        success: successMsgs,
        error: errorMsgs,
      });
    })
  );
  

router.route("/")
.get(asyncWrap(listingController.index))//index Route
.post(
    logedIn,
    upload.single("listing[image]"),
  //  validateListing,
    asyncWrap(listingController.createNewListing)
);//create Route

//new Route
router.get("/new",logedIn,listingController.renderNewForm);


router.route("/:id")
.get(asyncWrap(listingController.showRoute))//show Route
.patch( logedIn, 
    isOwner, 
    upload.single("listing[image]"),
   // validateListing, 
    asyncWrap(listingController.updateForm))//Update route
.delete(logedIn,isOwner,asyncWrap(listingController.deleteForm));

router.get("/category/:option",async(req,res)=>{
    let{option}=req.params;
   let allListings=await Listing.find({category:`${option}`});
//    console.log(option,allListings);
 res.render("listings/index.ejs",{allListings});
 // res.send("Great");
 });

//Edit Route
// isOwner
router.get("/:id/edit", logedIn,isOwner, asyncWrap(listingController.editForm));
router.post("/:id/booking",logedIn,isOwner,async(req,res)=>{
  //  console.log("_______________________________________")
     let{id}=req.params;
     let list=await Listing.findById(id).populate("owner");
     console.log(list);
  //  console.log(list);
     let owner_id=list.owner._id;
     let owner_cust=await User.findById(owner_id).populate({path:"customers",populate:{path:"owner"}}).populate({path:"customers",populate:{path:"place"}});
      console.log(owner_cust);
  let all_customers=owner_cust.customers;
  console.log(all_customers);
 res.render("listings/customer.ejs",{all_customers,price:list.price,location:list.title});
  
});

router.get("/calendar/:place", async (req, res) => {
    //  res.send("Hello")
       const bookings = await Booking.find({}).populate('place');
      // res.render("calendar", { bookings });
      // console.log(bookings)
      const title = req.params.place;
      console.log(title)
      res.render("listings/calendar.ejs",{bookings,title:title})
  });
 
  router.get('/wishlist/:listingId',logedIn ,async (req, res) => {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;
  
    // Prevent duplicates
    if (!user.wishlist.includes(listingId)) {
      user.wishlist.push(listingId);
      await user.save();
    }
  // return res.send("Hello")
    req.flash('success', 'Added to wishlist!');
    res.redirect('/listings');
  });
  
 module.exports=router;