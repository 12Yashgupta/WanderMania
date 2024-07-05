const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js")
let User=require("../models/user.js");
let {listingSchema}=require("../schema.js");
let asyncWrap=require("../utils/asyncWrap.js");
let expressError=require("../utils/expressError.js");
let {logedIn,checkListAuthorization}=require("../middleware.js");
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
    checkListAuthorization, 
    upload.single("listing[image]"),
   // validateListing, 
    asyncWrap(listingController.updateForm))//Update route
.delete(logedIn,checkListAuthorization,asyncWrap(listingController.deleteForm));

router.get("/category/:option",async(req,res)=>{
    let{option}=req.params;
   let allListings=await Listing.find({category:`${option}`});
//    console.log(option,allListings);
 res.render("listings/index.ejs",{allListings});
 // res.send("Great");
 });

//Edit Route
router.get("/:id/edit", logedIn, checkListAuthorization, asyncWrap(listingController.editForm));
router.post("/:id/booking",async(req,res)=>{
  //  console.log("_______________________________________")
     let{id}=req.params;
     let list=await Listing.findById(id).populate("owner");
  //  console.log(list);
     let owner_id=list.owner._id;
     let owner_cust=await User.findById(owner_id).populate({path:"customers",populate:{path:"owner"}}).populate({path:"customers",populate:{path:"place"}});
    
  let all_customers=owner_cust.customers;
  console.log(all_customers);
 res.render("listings/customer.ejs",{all_customers,price:list.price,location:list.title});
   // console.log("_____________________________________________________");
//res.send("Book");
});
 module.exports=router;