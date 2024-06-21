// create model and schema //
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// create schema //
const listingSchema = new Schema({
    title:{
        type:String,
        require:true,
    },
     description:{
        type : String,
        require:true,
     },
     
    image:{
        type:String,
        default: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-…",
        // url set 
        set:(v)  =>
            v==="" ? "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-…" 
            : v,
    },
    price:Number,
    location:{
        type:String,
    },
    country:String,

    // extra added review //
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
});

// listings ko delete kare to database me se uske all reviews bhi delete ho jay //
// middleware //
 listingSchema.post("findOneAndDelete" , async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in : listing.reviews}})
  }
})

const listing = mongoose.model("listing" , listingSchema);
module.exports = listing; 