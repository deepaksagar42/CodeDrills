const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
require("dotenv").config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
     console.log("🔐 Google profile:", profile);
    const email = profile.emails[0].value;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: null // user will set this later
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
     console.log("🧠 Deserialized user:", user);
    done(null, user); 
  } catch (err) {
     console.error("❌ Error in deserializeUser:", err);
    done(err, null);
  }
});
