const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");

async function getOrCreateRating() {
  let doc = await Rating.findOne();
  if (!doc) doc = await Rating.create({});
  return doc;
}

// 🔽 Get current like status
router.get("/ratings", async (req, res) => {
  const rating = await getOrCreateRating();
  const userId = req.user?._id;

  const liked = userId ? rating.likedUsers.includes(userId) : false;

  res.json({ likes: rating.likes, liked });
});

// ❤️ Handle like
router.post("/ratings/like", async (req, res) => {
  console.log("✅ Checking user:", req.user || req.session.user);


  const userId = req.user?._id || req.session?.user?.userId;
   if (!userId) {
    console.log("❌ Not authenticated");
    return res.status(401).json({ error: "Login first" });
  }

  const rating = await getOrCreateRating();

  // If user hasn't liked yet, increment
  if (!rating.likedUsers.includes(userId)) {
    rating.likes += 1;
    rating.likedUsers.push(userId);
    await rating.save();
  }

  res.json({ likes: rating.likes });
});


// ✅ Export the router so app.use() can use it
module.exports = router;
