const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },

  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  friends: [String],
});

module.exports = mongoose.model("User", userSchema);
