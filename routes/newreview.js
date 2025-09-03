const express=require("express");
const router=express.Router({mergeParams:true});  //mergeParams is udsed tio incliude the parent router info
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const methodOverride=require("method-override");
/*validate review*/

const validateReview=(req,res,next)=>{

   let {error}= reviewSchema.validate(req.body);
 if(error){
  let errmsg=error.details.map((el)=> el.message).join(",");
  throw new ExpressError(400,errmsg);
 }
 else{
  next();
 }
}



  /*review*/
  //post route
  router.post("",validateReview,wrapAsync(async(req,res)=>{
          let listing= await Listing.findById(req.params.id)
         let newReview=new Review(req.body.review);
         req.flash("success", "New review added successfully!");
         listing.reviews.push(newReview);
         await newReview.save();
         await listing.save();
         console.log("new review saved");
        res.redirect(`/listings/${listing._id}`);
     }));

     // delete review route
     router.delete("/:reviewId",wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{ $pull: { reviews: reviewId } });  //$pull operator is used
   await Review.findByIdAndDelete(reviewId);  //delete review
   req.flash("success", "review deleted");
   res.redirect(`/listings/${id}`);
     }));
  

     module.exports=router;