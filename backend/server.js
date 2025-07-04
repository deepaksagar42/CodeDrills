const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const passport = require("passport");
const MongoStore = require("connect-mongo");

const app = express();
require("./config/passport");
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());


app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // or MongoDB Atlas URL
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7 // ⏰ 7 days (in seconds)
  }),
  cookie: {
    httpOnly: true,
    secure: false, // true if you're using HTTPS
     sameSite: "none", 
    maxAge: 1000 * 60 * 60 * 24 * 7 // 💾 7 days (in ms)
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: "https://codedrills.onrender.com", 
  credentials: true,
}));


const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));
//routes
const authRoutes = require("./routes/authroutes");
app.use("/api", authRoutes);

const contestRoutes = require('./routes/contestroutes');
app.use('/api', contestRoutes);

const userContestRoutes = require("./routes/userContestRoutes");
app.use("/api", userContestRoutes);


const friendsRoutes=require("./routes/friendsroutes");
app.use("/friends", friendsRoutes);

app.use("/api", require("./routes/codeforcesRoutes"));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "Home/home.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
