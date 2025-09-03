// Install express-session, connect-flash
const express = require("express");     
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session config
const sessionoption = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie:{
         maxAge: 7 * 24 * 60 * 60 * 1000,   //not working check on it
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    httpOnly:true,    //only for security tp prevent from cross cryptic attack
};

// Middlewares
app.use(session(sessionoption));
app.use(flash()); // call flash() not flash

// Routes
app.get("/register", (req, res) => {
    let { name = "anonymous" } = req.query;
    req.session.name = name; 
    console.log(req.session);
    console.log(req.session.name);
    if(name==="anonymous"){
        req.flash("error", "User  not registered ");

    }
    else{
    req.flash("success", "User registered successfully");  // ✅ set flash
    
    }
    res.redirect("/hello");
});

/*app.get("/hello", (req, res) => {
    const successMsg = req.flash("success"); 
    res.render("page.ejs", {name: req.session.name, message: successMsg});
});
*/
 ////or
 app.get("/hello", (req, res) => {
   res.locals.succmessage=req.flash("success"); 
   res.locals.errormessage=req.flash("error"); 
    res.render("page.ejs", {name: req.session.name});
});
// Start server
app.listen(3000, () => {
    console.log("App is listening on port 3000");
});
