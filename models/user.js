const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Booking=require("./booking.js");
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    bookings:[
        {
          type:Schema.Types.ObjectId,
          ref:"Booking"
        }
    ],
     customers:[
        {
              type:Schema.Types.ObjectId,
              ref:"Booking"
        }
     ]
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);