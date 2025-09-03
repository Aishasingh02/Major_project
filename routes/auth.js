
const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();

// show register form
router.get("/register", (req, res) => {
  res.render("authentication/register.ejs");
});

// handle register
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
  console.log("Registration error:", e);
  req.flash("error", e.message);
  res.redirect("/listings");
}
});


// show login form
router.get("/login", (req, res) => {
  res.render("authentication/login.ejs");
});

//login

router.post("/login", async (req, res, next) => {
  const {email, password } = req.body;
console.log(email);

console.log(password);
  // Step 1: Check if user exists
  const existingUser = await User.findOne({ email});
  console.log(existingUser);
  if (!existingUser) {
    req.flash("error", "You are not registered, please register first!");
    return res.redirect("/register");
  }

  // Step 2: Authenticate
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", "Incorrect credentials!");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome back!");
      return res.redirect("/listings");
    });
  })(req, res, next);
});


// logout
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
