const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Rating", ratingSchema);
