const express = require("express");
const router = express.Router();
const authController = require("../controller/authcontroller"); 
const passport = require("passport");
const User = require("../models/user");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getUser);

router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));
 router.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/Home/home.html", // or your custom error page
    session: true
  }),
  (req, res) => {
    console.log("🔐 Google callback hit. req.user =", req.user);
    if (!req.user.username) {
      return res.redirect("/setusername/setusername.html");
    }
    res.redirect("/Home/home.html");
  }
);

router.post("/auth/set-username", async (req, res) => {

     try{
         console.log("🧪 req.user =", req.user);
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { username } = req.body;
   console.log("📥 Received username:", username);

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  req.user.username = username;
  await req.user.save();
 
  res.json({ message: "Username set successfully", username });
     }
     catch (err) {
    console.error("🔥 Error in /set-username:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }

});


module.exports = router;
