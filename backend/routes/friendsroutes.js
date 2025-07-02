const express = require("express");
const router = express.Router();
const friendsController = require("../controller/friendscontroller");
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, friendsController.getFriends);
router.post('/add', authenticate, friendsController.addFriend);
router.post('/remove', authenticate, friendsController.removeFriend);

module.exports = router;
