const express = require("express");
const router = express.Router();
const authController = require("../controller/authcontroller"); 

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getUser);

module.exports = router;
