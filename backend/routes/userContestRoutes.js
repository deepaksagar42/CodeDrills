const express = require("express");
const router = express.Router();
const { getUserContests } = require("../controller/userContestController");


router.get("/user-contests/:username", getUserContests);

module.exports = router;
