let User=require("../models/user.js");
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
 }
module.exports.signup=async(req,res,next)=>{
    try{
    let{username,email,password}=req.body;
    let newUser=new User({email,username});
    let user=await User.register(newUser,password);
    req.login(user,(err)=>{
       if(err)
       return next(err);

       req.flash("success","Welcome to WanderLust")
       res.redirect("/listings");
    })
  
    }
    catch(err){
       req.flash("error",err.message);
       res.redirect("/signup");
    }
 };

 module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login");
 };

 module.exports.login=async(req,res)=>{    
    console.log(req.path,"..",req.originalUrl);
    req.flash("success","Welcome back to WanderLust");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
    req.logOut((err)=>{
       if(err)
       next(err);
 
    req.flash("error","You are loged-out successfully");
    res.redirect("/listings");  
   })
 };