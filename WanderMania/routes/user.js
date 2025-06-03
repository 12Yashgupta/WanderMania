const express=require("express");
const router=express.Router();
let asyncWrap=require("../utils/asyncWrap.js");
let expressError=require("../utils/expressError.js");
//const User=require("../models/user.js");
const passport=require("passport");
const{saveredirectUrl, logedIn}=require("../middleware.js");
let Booking=require("../models/booking.js");
let Listing=require("../models/listing.js");
let User=require("../models/user.js");
let userController=require("../controllers/users.js");
const multer = require('multer');
const { storage } = require('../clouconfig.js'); // configure this separately
const upload = multer({ storage });
router.route("/signup")
.get(userController.renderSignupForm)
.post(asyncWrap(userController.signup));


router.route("/login")
.get(userController.renderLoginForm)
.post(saveredirectUrl
   ,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true})
   ,userController.login);

router.get("/logout",userController.logout);
router.get("/profile",async(req,res)=>{//profile route
      
   //  console.log("Profile route");
      let username=req.user.username;
      let allListing=await Listing.find({}).populate("owner");
      let listings=[];
       for(let list of allListing)
         {
            if(username==list.owner.username)
            listings.push(list);
         }
         const user = req.user;
        let listId=req.user._id;
       res.render("users/profile1.ejs",{listings,listId,name:req.user.username,email:req.user.email,user});
});
router.get("/profile/booking",async (req,res)=>{
    // let id=req.user.bookings[0];
   //  console.log(id);
     // console.log(req.user);
      let bookings=(req.user.bookings)
     // console.log(bookings);
      let totalList=[];
      for(let book of bookings)
            {
      let list=await Booking.findById(book._id).populate("owner").populate("place");
      totalList.push(list); 
      }
      var today =new Date();
   var dd = String(today.getDate());
   var mm=String(today.getMonth()+1);
   var yy=String(today.getFullYear());
    var curr_date=dd+"/"+mm+"/"+yy;
          //  console.log(totalList);
   //  console.log(totalList);
  // res.send("Booked")
   //let invoice=req.session.invoice;
  // console.log(curr_date," ",invoice);
   //res.send("Hello");
   // console.log(totalList)
    totalList = totalList.filter(item => item != null);
   console.log(totalList.length)
      res.render("users/profile.ejs",{totalList,curr_date}); 
});

router.delete("/profile/customers/:id",async(req,res)=>{
  
      let booking_id = req.params.id;
    const result=  await Booking.findByIdAndUpdate(booking_id,{status:'cancelled'});
 //   console.log(result)
    //res.send("Hello")
   
    req.flash("error","Customer booking is deleted!")
    res.redirect("/profile")
   
   });
router.post("/profile/customer",async(req,res)=>{
   console.log(req.user);
   let owner_cust=await User.findById(req.user._id).populate({path:"customers",populate:{path:"owner"}}).populate({path:"customers",populate:{path:"place"}});
//   console.log("____________________________________________");
//    console.log(owner_cust);
//    console.log("________________________________________________");
  res.render("users/customers.ejs",{owner:owner_cust.customers});
});
router.delete("/profile/:id",async(req,res)=>{
  let{id}=req.params;
  let book_place=await Booking.findById(id);
 // console.log(book_place);
  let ownerId=book_place.owner._id;
  let owner=await User.findById(ownerId);
  let placeId=book_place.place._id;
  let place=await Listing.findById(placeId);
//  console.log(owner," ",place);
  //await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
 let l= await Listing.findByIdAndUpdate(placeId,{$pull:{bookings:id}});
 let u= await User.findByIdAndUpdate(ownerId,{$pull:{bookings:id}});
 //let b= await Booking.findByIdAndDelete(id);
 let b = await Booking.findByIdAndUpdate(id,{status:'cancelled'});
 console.log(b)
 //console.log(l," ",u," ",b);
 console.log("working")
 req.flash("error","Booking deleted!");
  res.redirect(`/profile/booking`);
});
router.post('/wishlist/:listingId', logedIn, async (req, res) => {
   await User.findByIdAndUpdate(req.user._id, {
     $pull: { wishlist: req.params.listingId }
   });
 
   req.flash('error', 'Removed from wishlist!');
   res.redirect('back');
 });
 router.get("/profile/history", async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch bookings where owner === logged-in user
    const bookings = await Booking.find({ owner: loggedInUserId })
      .populate("place")
      .sort({ createdAt: -1 });

    // Split into active and cancelled
    const activeBookings = bookings.filter(b => b.status === "active");
    const cancelledBookings = bookings.filter(b => b.status === "cancelled");
console.log(activeBookings,cancelledBookings)
    res.render("users/history", {
      activeBookings,
      cancelledBookings
    });
  } catch (err) {
    console.error("Error fetching booking history:", err);
    res.redirect("/profile");
  }
});
router.post("/remove-booking/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const loggedInUserId = req.user._id;  // Assuming you have user info in req.user

    // Find the booking by ID and check if the logged-in user is the owner
    const booking = await Booking.findById(bookingId);

    if (booking.owner.toString() !== loggedInUserId.toString()) {
      return res.status(403).send("You are not authorized to delete this booking.");
    }

    // Delete the booking if the user is the owner
    await Booking.findByIdAndDelete(bookingId);

    // Redirect to the booking history page
    req.flash('error',"History removed!")
    res.redirect("/profile/history");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});
router.post('/profile/updatePic', upload.single('profilePic'), async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  user.profilePic = {
    url: req.file.path,
    filename: req.file.filename
  };

  await user.save();
  res.redirect('/profile');
});
module.exports=router;