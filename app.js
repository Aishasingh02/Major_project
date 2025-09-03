const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate =require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const session = require("express-session");   //
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user.js");
const Review=require("./models/review.js");
const Listing=require("./models/listing.js");
const listings=require("./routes/newlisting.js");
const reviews=require("./routes/newreview.js");
const authRoutes = require("./routes/auth.js");
const MONGO_URL=('mongodb://127.0.0.1:27017/wanderlust');
app.set("views engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

app.engine("ejs",ejsMate);
main()
.then(()=>{
    console .log("connected to db")
})
.catch((err)=>{
    console.log(err)
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const port=3000;

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true ,
    cookie:{
         maxAge: 7 * 24 * 60 * 60 * 1000,   //not working check on it
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    httpOnly:true,  
};
 //sessions
app.use(session(sessionOptions));
app.use(flash());

 // passpotrs
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//locals(flash+currentuser)
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
   res.locals.error=req.flash("error");
     res.locals.currentUser = req.user; //  important for navbar
  
  //console.log(  res.locals.success);
  next();      //important to next otherwise middleware will remain in this only
});


//routes

app.use("/listings",listings);  //for listing route
app.use("/listings/:id/reviews",reviews);  //for review route
app.use("/", authRoutes); //for login routes

app.get("/",(req,res)=>{
  res.render("listings/home.ejs");
});


//error handling
app.use((req,res,next)=>{
  next(new ExpressError (404,"page not found"));
});


app.use((err,req,res,next)=>{
  let{statuscode=500,message="something wrong"}=err;
 res.status(statuscode).render("error.ejs",{message} );
});


app.listen(3000,()=>{
    console.log("app is listening ");
});


