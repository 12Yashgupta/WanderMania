const mongoose=require("mongoose");
const schema=mongoose.Schema;
let reviewSchema=new schema({
    comment:String,
    rating:{
        type:String,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:schema.Types.ObjectId,
        ref:"User"
    }
});
let Review=mongoose.model("Review",reviewSchema);
module.exports=Review;