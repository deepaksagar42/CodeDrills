const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");


const app = express();
const PORT = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/cp")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());


app.use(session({
  secret: "secretkey123",
  resave: false,
  saveUninitialized: false, 
  cookie: { secure: false }, 
}));

app.use(cors({
  origin: "http://localhost:3000", 
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


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
