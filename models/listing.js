const mongoose=require("mongoose");
let Review=require("./review.js");
let User=require("./user.js");
let Booking=require("./booking.js")
const schema=mongoose.Schema;

const listingSchema=new schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        url:String,
        filename:String
    //     type:String,
    //     default:"https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    //     set:(v)=>v===""?"https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60":v
     },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },
    reviews:[{
        type:schema.Types.ObjectId,
        ref:"Review"
    }],
    owner:{
        type:schema.Types.ObjectId,
        ref:"User"
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
      category:{
        type:String,
        enum:["Trending","Rooms","Campings","Farms","Mountains","Pools","Castles","Arctic"]
      },
      bookings:[
       {
          type:schema.Types.ObjectId,
          ref:"Booking"
       }
    ],
      maxGuest:{
        type:Number
      }
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
      await  Review.deleteMany({_id:{$in:listing.reviews}});
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;