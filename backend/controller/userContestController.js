const { Contest } = require("../models/contestmodels");

const getUserContests = async (req, res) => {
  const { username } = req.params;
  console.log("🔍 Looking for contests for user:", username);

  try {
    // ✅ Find contests where the user signed up
    const contests = await Contest.find({ "signups.username": username });
    res.json({ contests });
  } catch (error) {
    console.error("❌ Error fetching user contests:", error);
    res.status(500).json({ message: "Error fetching user contests" });
  }
};

module.exports = { getUserContests };
