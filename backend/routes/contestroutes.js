const express = require("express");
const router = express.Router();
const {
  createContest,
  getContestsByUser,
  signupContest,
  getSignups,
  getStandings,
  addProblemsToContest,
  getAssignedProblems,
  assignProblems,
  getContestById,
  getLiveContestsForUser,
  contestinviatation

} = require("../controller/contestcontroller");

router.post("/createcontest", createContest);
router.get("/user/:username/contest", getContestsByUser);
router.get("/contest/:id", getContestById);


router.post("/contest/:id/signup", signupContest);
router.get("/contest/:id/signups", getSignups);
 
router.get('/contest/:id/standings', getStandings);

router.post("/contest/:id/add-problems", addProblemsToContest);
router.get("/contest/:id/problems", getAssignedProblems);
router.post("/contest/:id/problems", assignProblems);
router.get("/contests/live", getLiveContestsForUser);

router.post("/contest/:id/send-invites",contestinviatation);
module.exports = router;
