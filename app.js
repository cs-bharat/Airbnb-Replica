require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const path = require("path");
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const Review  = require("./models/review.js");


// eje - mate 
const ejsMate = require("ejs-mate"); // help to create a layout

// const mongo_url = "mongodb://127.0.0.1:27017/Airbnb";
main()
.then(()=>{
    console.log("server is connected db");
}).catch((err) =>{
 console.log(err);
})

async function main(){
  await mongoose.connect(process.env.mongo_url);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate); // use ejs-mate
app.use(express.static(path.join(__dirname, "/public")));

// server side validation //
const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        // error ke sath extra detail so nhi karvani tab /
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        // error ke sath extra detail so nhi karvani tab /
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}
//----- end validation server side ------//

// index route
app.get("/listings" , wrapAsync(async(req,res)=>{
    // database se data access kiya => parse karenge//
   const allListings = await Listing.find({});
   res.render("listing/index.ejs" , {allListings});
    // res.send("listings working.");
}));


// new route  <-> create route //
app.get("/listings/new" , (req,res)=>{
    // res.send("wait 2 minute");
    res.render("listing/new.ejs");
})

// create route //
app.post("/listings", validateListing , wrapAsync( async(req,res,next)=>{
    // all data ko accetract karna padega //
    // let{title,description, image,price , location,country} = req.body; //
   
       // try{}.catch{} se batter (wrapAsync) ka use bhi kar sakte he //
        // utilis=> wrapAsync.js // function .export karo. 

        // if(!req.body.listing){
        //     throw new ExpressError(400, "send valid data for listings.")
        // }
                // bettar way
           let result =  listingSchema.validate(req.body)
        //    console.log(result); 
           if(result.error){
             throw new ExpressError(400 , result.error);
            }   
        const newListings = new Listing(req.body.listing);
        //    console.log(newListings);
           await newListings.save();
           res.redirect("/listings");
}));


// show route
app.get("/listings/:id" , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const Onelisting = await Listing.findById(id).populate("reviews");
    res.render("listing/show.ejs" , {Onelisting});
}));

// edit route <-> update route
app.get("/listings/:id/edit" , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const Onelisting = await Listing.findById(id);
    res.render("listing/edit.ejs" , {Onelisting})
}));
 
// update route
app.put("/listings/:id" ,validateListing , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let result = await Listing.findByIdAndUpdate(id , {...req.body.listing});
    // console.log(result);
    res.redirect(`/listings/${id}`);
   
}));


// delete route //
app.delete("/listings/:id" ,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    // console.log(deleteListing);
    res.redirect("/listings");
}));

// review route // 
// (validateReview) as a middleware used //
app.post("/listings/:id/reviews" , validateReview , wrapAsync(async(req,res) =>{
   let listing =  await Listing.findById(req.params.id)
   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();

   console.log("new reviewd saved")
//  res.send("new review saved done👍");
   res.redirect(`/listings/${listing._id}`);
}));

// delete review route //
app.delete("/listings/:id/reviews/:reviewId" , wrapAsync(async (req,res)=>{
    let {id, reviewId} = req.params;
    // console.log(reviewId);
    await Listing.findByIdAndUpdate(id, {$pull :{reviews : reviewId}});
    // mongoose operator used kiya he ($pull) ,, listing me review array ke under value find karega (reviewId) or useko delete karna.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
})
)

// app.get("/testlisting" ,async(req,res)=>{
//     let samplelisting =  new Listing({
//          title:"My new villa",
//          description:"By the beach",
//          price:1200,
//          location:"Calangute Goa",
//          country:"India",
//     });
   
//      // save the database //
//     await samplelisting.save();
//     console.log("sample data was saved on database!");
//     res.send("suceessful testing ");
// })


app.get("/" , (req,res)=>{
    // res.send("Airbnb is working.!");
    res.render("listing/home.ejs");
})

// koi invalide path ho or client us per request behej tab//
app.all("*" , (req,res,next) =>{
    next(new ExpressError(404, "sorry page not found!!"));
})

// create middlewares
app.use((err,req,res,next)=>{
    let{statusCode=500 , message="somthing went rong."} = err;
    // res.status(statusCode).send(message);
    res.render("listing/error.ejs" , {message});
})

app.listen(process.env.PORT, ()=>{
    console.log(`server is listening on port :${port}`);
})                        