const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/user.status", async (req, res) => {
  const { handle } = req.query;
  if (!handle) {
    return res.status(400).json({ message: "Missing handle" });
  }

  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    res.json(response.data);
  } catch (err) {
    console.error("Codeforces API error:", err.message);
    res.status(500).json({ message: "Failed to fetch user status from Codeforces" });
  }
});

module.exports = router;
