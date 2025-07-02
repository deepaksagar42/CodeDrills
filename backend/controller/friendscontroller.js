 const User = require('../models/user');
exports.getFriends = async (req, res) => {
  console.log("💡 req.user:", req.user);
  const userEmail = req.user.email;
  try {
    const user = await User.findOne({ email: userEmail });
    res.json({ friends: user.friends });
  } catch (err) {
    res.status(500).json({ message: "Error fetching friends" });
  }
};

exports.addFriend = async (req, res) => {
  const userEmail = req.user.email;
  const { friendEmail } = req.body;

  if (userEmail === friendEmail) {
    return res.status(400).json({ message: "You cannot add yourself" });
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (user.friends.includes(friendEmail)) {
      return res.status(400).json({ message: "Friend already added" });
    }

    const friendExists = await User.findOne({ email: friendEmail });
    if (!friendExists) {
      return res.status(404).json({ message: "Friend email not found" });
    }

    user.friends.push(friendEmail);
    await user.save();
    res.json({ message: "Friend added" });
  } catch (err) {
    res.status(500).json({ message: "Error adding friend" });
  }
};

exports.removeFriend = async (req, res) => {
  const userEmail = req.user.email;
  const { friendEmail } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    user.friends = user.friends.filter(f => f !== friendEmail);
    await user.save();
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ message: "Error removing friend" });
  }
};