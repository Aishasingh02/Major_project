const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const methodOverride=require("method-override");
const { isLoggedIn } = require("../middleware");  //export middleware


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login"); // redirect to login page
  }
  next();
};



/* validation of schema*/


const validateListing=(req,res,next)=>{

   let {error}= listingSchema.validate(req.body);
 if(error){
  let errmsg=error.details.map((el)=> el.message).join(",");
  throw new ExpressError(400,errmsg);
 }
 else{
  next();
 }
}

  // idex route   ginve list 

router.get("/", wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
   // console.log(allListings[0].image.url);
   res.render("listings/index.ejs",{allListings});
}));


// create route
// a) new -form is opened
router.get("/new", isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs")
});




//b)  create
router.post("/",isLoggedIn, validateListing,wrapAsync(async(req,res)=>{
    //let(title,description,url,price,location,country)=req.body; we can do this but we can chane the variables into obgect's key
    let list=req.body.listing;
    //if(!req.body.listing){
    //  throw new ExpressError(400," Send valid data for listing");   // this error handling is there client tried to send req by hoppacotch but the body is empty in that case this error will be shown
    //}
     // console.log(list);
  // let result= listingSchema.validate(req.body);
// console.log(result);
// if(result.error){
//  throw new ExpressError(400,result.error);
// }
  
    const newlisting=new Listing(list);
    await newlisting.save();
        req.flash("success", "New listing successfully!");
    res.redirect("/listings");

     
}));

//show route
router.get("/:id",  wrapAsync(async(req,res)=>{
  let{id}=req.params
const listing=await  Listing.findById(id) .populate("reviews");
if(!listing){
req.flash("error", "listing u reqeusted does not exit");
res.redirect("/listings");

}
res.render("listings/show.ejs",{listing});
}));




//  update route
//a) edit form
  router.get("/:id/edit", wrapAsync( async(req,res)=>{
    let{id}=req.params;
    const listing=await  Listing.findById(id);
    if (!listing) {
            res.send("no listing found");
        }
    res.render("listings/update.ejs",{listing});

  }));

  //b) update route;

  router.put("/:id",  validateListing, wrapAsync(async(req,res)=>{
     // now this is not needed as validation is done by joi if(!req.body.listing){
      //throw new ExpressError(400," Send valid data for listing");   // this error handling is there client tried to send req by hoppacotch but the body is empty in that case this error will be shown
     // }
      let{id}=req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     console.log( await Listing.findByIdAndUpdate(id,{...req.body.listing.image.url}));
     req.flash("success", "listing  updated successfully!");
     res.redirect(`/listings/${id}`);
  }));

  //delete
  router.delete("/:id", wrapAsync(async (req, res) => {
  console.log("Delete route hit for id:", req.params.id);
  console.log("deleting");
  const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    console.log("deleting");
  console.log("Deleted:", deletedListing);
  req.flash("success", "listing deleted successfully!");
  res.redirect("/listings");
}));

 module.exports=router;



 
 /*app.get("/testListing",async(req,res)=>{
     let sampleListing=new Listing({
     title:"My New Villa",
     description:"By the Beach",
     price:1200,
     location:"Patna ,Bihar",
     country:"India",
 });
   await sampleListing.save();
   console.log("sample was saved");
   res.send("sucessful testing");
 });
 */