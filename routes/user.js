const express=require("express");
const router=express.Router();
let asyncWrap=require("../utils/asyncWrap.js");
let expressError=require("../utils/expressError.js");
//const User=require("../models/user.js");
const passport=require("passport");
const{saveredirectUrl}=require("../middleware.js");
let Booking=require("../models/booking.js");
let Listing=require("../models/listing.js");
let User=require("../models/user.js");
let userController=require("../controllers/users.js");
router.route("/signup")
.get(userController.renderSignupForm)
.post(asyncWrap(userController.signup));


router.route("/login")
.get(userController.renderLoginForm)
.post(saveredirectUrl
   ,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true})
   ,userController.login);

router.get("/logout",userController.logout);
router.get("/profile",async(req,res)=>{
      
     console.log("Profile route");
      let username=req.user.username;
      let allListing=await Listing.find({}).populate("owner");
      let listings=[];
       for(let list of allListing)
         {
            if(username==list.owner.username)
            listings.push(list);
         }
        let listId=req.user._id;
       res.render("users/profile1.ejs",{listings,listId,name:req.user.username,email:req.user.email});
});
router.get("/profile/booking",async (req,res)=>{
    // let id=req.user.bookings[0];
   //  console.log(id);

      let bookings=(req.user.bookings)
      console.log(bookings);
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
      res.render("users/profile.ejs",{totalList,curr_date}); 
});
router.post("/profile/customers",async(req,res)=>{
   console.log(req.user);
   let owner_cust=await User.findById(req.user._id).populate({path:"customers",populate:{path:"owner"}}).populate({path:"customers",populate:{path:"place"}});
  console.log("____________________________________________");
   console.log(owner_cust);
   console.log("________________________________________________");
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
 let b= await Booking.findByIdAndDelete(id);
 //console.log(l," ",u," ",b);
  res.redirect(`/profile/booking`);
});
module.exports=router;