if(process.env.Node_ENV!="production"){
require('dotenv').config()
console.log(process.env.SECRET)
}

const express=require("express");//done
//const app=express();//done
const app=express();//done
const mongoose=require("mongoose");//done
const port=8040;//done
const MONGO_LINK="mongodb://127.0.0.1:27017/WanderLust";//done
const Listing=require("./models/listing.js")
let Booking=require("./models/booking.js")
//const http = require("http");
//const { Server } = require("socket.io");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
//const app = express();
//const server = http.createServer(app);
//const io = new Server(server); // THIS makes /socket.io/socket.io.js available!


// server.listen(port, () => {
//   console.log("Server running on port 3000");
// });

// Socket.IO handlers
// io.on("connection", socket => {
//   console.log("a user connected");

//   socket.on("joinRoom", roomId => {
//     socket.join(roomId);
//   });

//   socket.on("chat message", data => {
//     io.to(data.room).emit("chat message", data);
//   });
// });
const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const { v4: uuidv4 } = require('uuid');


//let User=require("./models/user.js");
const path=require("path");//done
let ejsMate=require("ejs-mate");//done
var methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.engine("ejs",ejsMate);
//let {listingSchema,review_Schema}=require("./schema.js");
let asyncWrap=require("./utils/asyncWrap.js");
let expressError=require("./utils/expressError.js");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const chatRoutes = require("./routes/chat");

//const chatRoutes = require("./routes/chat.js");

//const http = require("http").createServer(app);

//const io = require("socket.io")(http);
 //var http=require("http").Server(app);
//const paymentRoute=require("./routes/paymentRoute.js");

io.on("connection", socket => {
    console.log("A user connected");
  
    socket.on("chat message", data => {
      io.to(data.room).emit("chat message", data); // Send to room
    });
  
    socket.on("joinRoom", room => {
      socket.join(room);
    });
  });

const session=require("express-session");
let flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const { allowedNodeEnvironmentFlags, title } = require("process");
let {logedIn,checkListAuthorization}=require("./middleware.js");
const { number } = require('joi');
app.use(express.json()); // For parsing application/json

const { uuid } = require('uuidv4');
async function main(){
    await mongoose.connect(MONGO_LINK);
 }
 
main()
.then(()=>{
    console.log("Connected to Db");
})
.catch((err)=>{
    console.log(err);
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));

let sessionOptions={
    secret: 'keyboard cat',
   resave: false,
   saveUninitialized: true,
   cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
   }
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//          email:"Yash@gmail.com",
//         username:"Yash Gupta"
//     }) ;
//    let newUser=await User.register(fakeUser,"yash1234");
//    console.log(req.user);
//    res.send(newUser);
// });


app.get("/",(req,res)=>{
    res.send("You are on root path");
})

//Profie
// app.get("/profile/customers/delete/:id",async(req,res)=>{
//     let id = req.params.id;
//     console.log(id)
//   //  const username = await Booking.find({_id:id})
//     await Booking.deleteOne({_id:id})
//     res.redirect("/profile")
//    // res.send("Booking deleted!")
// })
//For searching listing

//Socket code
// io.on("connection", socket => {
//     console.log("A user connected");
  
//     socket.on("chat message", data => {
//       io.to(data.room).emit("chat message", data); // Send to room
//     });
  
//     socket.on("joinRoom", room => {
//       socket.join(room);
//     });
//   });



//for booking
app.get("/listings/:id/booking",logedIn,async(req,res,next)=>{
    try{
        let userid=req.user.id;
        let{id}=req.params;
        
        let hotelList=await Listing.findById(id).populate("owner");//listing id
        let hotelUser=await User.findById(userid);//user id
        let checkin=req.query.booking.start;
        let checkout=req.query.booking.end;
        let guest=req.query.booking.guest;
        
          let date1=new Date(checkin);
          let date2=new Date(checkout); 
         
         let time_difference = date2.getTime() - date1.getTime();    
         let days_difference = time_difference / (1000 * 60 * 60 * 24); 
         if(time_difference<0 || days_difference<0){
             req.flash("error","Please enter the valid date");
             res.redirect(`/listings/${id}`)
             return;
         }
        // console.log(hotelList);
          let max_guest=hotelList.maxGuest;
         if(guest<=0 || guest>(max_guest))
             {
                 req.flash("error",`Please enter the guest between 1 to ${hotelList.maxGuest}`);
                 res.redirect(`/listings/${id}`)
                 return;
             }
     
             const date = new Date();

             // Step 1: Format it as YYYY-MM-DD string
             const dateStr = date.toISOString() // "2025-04-12"
             
             // Step 2: Convert it back to Date (time = 00:00:00)
             const dateOnly = new Date(dateStr);
             
            //  console.log(dateOnly);       // 👉 "2025-04-12T00:00:00.000Z"
            //  console.log(typeof dateOnly); 
            //  console.log(date1,date2)
            //  console.log(typeof date1,typeof date2)

             if(dateOnly>=date1 || dateOnly>=date2)
             {
                   req.flash("error","Please enter correct check-in and check-out dates");
                   res.redirect(`/listings/${id}`)
                   return;
             }
             let result = await Booking.find().populate('owner').populate('place')
             const new_result = result.filter(item => {
              if(item.place._id==id)
                return true 
              });
              console.log(new_result)
             
              const exists = new_result.some(b =>
                {
                    start_date =  new Date(b.start)
                    end_date  = new Date(b.end)
                  return   (start_date<=date1 && date1<=end_date && b.status=='active')
                });
             if(exists==true)
             {
                req.flash("error","OOPS!, This place is already booked for this date")
                res.redirect(`/listings/${id}`)
                return;
             }
             console.log(exists)
         let booking={
            start:req.query.booking.start,
            end:req.query.booking.end,
            guest:req.query.booking.guest,
            owner:userid,
            place:id,
            days:days_difference
         };
      
          let newBook=new Booking(booking);
         let book= await newBook.save();
        
         hotelUser.bookings.push(book._id);
         await hotelUser.save();
         hotelList.bookings.push(book._id);
        let hotel =  await hotelList.save();
       let OwnerList=await User.findById(hotelList.owner._id);
       OwnerList.customers.push(book._id);
       await OwnerList.save();
   //    console.log(OwnerList);
    
   var today =new Date();
   var dd = String(today.getDate());
   var mm=String(today.getMonth()+1);
   var yy=String(today.getFullYear());
    var curr_date=dd+"/"+mm+"/"+yy;
   let list_name=hotelList.title;
   let list_price=hotelList.price;
  //console.log(list_price,days_difference,guest,list_name,list_price);
   //res.send("Booked");
  // console.log(curr_date," ",mm);
   let invoice=uuidv4().substring(0,8);
   //req.user.invoice=invoice;
  // module.exports.invoice=invoice;
//   res.send("Book") 
  // console.log(hotel);
    console.log("This is booking method.")
   // res.send("Hello");
   res.render("payment/product1.ejs",{curr_date,days_difference,guest,list_name,list_price,name:hotelUser.username,email:hotelUser.email,invoice});
}
catch(err){
       next(err);
}
});
// app.post("/profile/customers/delete/:id%",async(req,res)=>{
//     console("Hello")
//     res.send("Hello!")
// })

//Payment

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const renderProductPage = async(req,res)=>{

    try {
        
        res.render('payment/product');

    } catch (error) {
        console.log(error.message);
    }

}

const createOrder = async(req,res)=>{
    try {
        const amount = req.body.amount*100
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
        // console.log(currUser);
        console.log(req.user);
        let{username,email,_id:id}=req.user;
        console.log(username,email,id);
        razorpayInstance.orders.create(options, 
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY,
                        product_name:req.body.name,
                        description:req.body.description,
                        contact:"",
                        name: `${username}`,
                        email:`${email}`
                    });
                }
                else{
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            }
        );
        // res.redirect("/listings");

    } catch (error) {
        console.log(error.message);
    }
}
app.get('/book', renderProductPage);
app.post('/createOrder',createOrder);




//For options
// app.get("/listings/catagory/:option",async(req,res)=>{
//    let{option}=req.params;
//   let allListings=await Listing.find({catagory:`${option}`});
//    res.render("listings/index.ejs",{allListings});
// });
app.use((req,res,next)=>{
    res.locals.message=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
   // console.log(res.locals.currUser)
    next();
 })
app.use("/listings",listingsRouter);
app.use("/listings/:id/review",reviewsRouter);
app.use("/",userRouter);
app.use("/", chatRoutes);

// app.use("/",chatRoutes);
//app.use("/",paymentRoute);

 app.all("*",(req,res,next)=>{
    res.status(403).send("Page not found!");
 })

 app.use((err,req,res,next)=>{
    let{status=500,message}=err;
    res.status(status).render("alert.ejs",{message});
  //  res.send("Something went wrong!");
 });
 
 http.listen(port,()=>{
    console.log("App listening on port 8040");
});
