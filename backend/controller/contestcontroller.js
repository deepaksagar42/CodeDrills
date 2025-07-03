const ContestModel = require("../models/contestmodels");
const Submission = require("../models/submissionmodels");
const { Contest } = require("../models/contestmodels"); // ✅ This gives you just the Mongoose model

const { sendInviteEmail } = require("../services/emailService");
const User=require("../models/user");
const axios = require("axios");

const createContest = async (req, res) => {
  try {
    const {
      name, startTime, endTime, noEnd,
      orgType, orgName, createdBy, createdAt
    } = req.body;

    if (!name || !startTime || !orgType || !orgName || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contest = await ContestModel.createContest({
      name,
      startTime,
      endTime: noEnd ? null : endTime,
      noEnd,
      orgType,
      orgName,
      createdBy,
      createdAt,
    });

      console.log("✅ Created contest in DB:", contest);
    return res.status(201).json({ id: contest._id, message: "Contest created successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getContestsByUser = async (req, res) => {
  const { username } = req.params;
  try {
    const contests = await ContestModel.getContestsByUser(username);
    return res.json({ contests });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const signupContest = async (req, res) => {
  const { id } = req.params;
  const { username, email, codeforceshandle } = req.body;

  try {
    if (!username || !email || !codeforceshandle) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await ContestModel.signupContest(id, username, email, codeforceshandle);
    console.log("📥 Signup data received:", { username, email, codeforceshandle });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};


const getSignups = async (req, res) => {
  const { id } = req.params;

  try {
    const signups = await ContestModel.getSignups(id);
    res.json({ signups });
  } catch (err) {
    res.status(500).json({ message: "Error loading signups", error: err.message });
  }
};

const getStats = async (req, res) => {
  const { id } = req.params;

  try {
    const stats = await ContestModel.getStats(id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Error loading stats", error: err.message });
  }
};

const addProblemsToContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { problems } = req.body;

    if (!problems || !Array.isArray(problems)) {
      return res.status(400).json({ message: "Invalid problems format" });
    }

    const contest = await ContestModel.getContestById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    contest.problems = problems;
    await contest.save();

    res.status(200).json({ message: "Problems added to contest successfully" });
  } catch (error) {
    console.error("Error adding problems to contest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAssignedProblems = async (req, res) => {
  const { id } = req.params;

  try {
    const problems = await ContestModel.getProblems(id);
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ message: "Error fetching problems", error: err.message });
  }
};

const assignProblems = async (req, res) => {
  const { id } = req.params;
  const { problem } = req.body;

  try {
    const result = await ContestModel.assignProblem(id, problem);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error assigning problem", error: err.message });
  }
};

const getContestById = async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await ContestModel.getContestById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contest", error: err.message });
  }
};

const getStandings = async (req, res) => {
  const { id: contestId } = req.params;

  try {
    const contest = await ContestModel.getContestById(contestId);

    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const problems = contest.problems || [];
    const signups = contest.signups || [];
    const startTime = new Date(contest.startTime);
    const endTime = contest.noEnd ? null : new Date(contest.endTime);
    const now = new Date();

    // 🧊 If contest ended and standings are frozen, return them
    if (endTime && now > endTime && contest.frozenStandings?.length > 0) {
      return res.json(contest.frozenStandings);
    }

    const problemSet = new Set(problems.map(p => `${p.contestId}-${p.index}`));
    const results = [];

    for (const user of signups) {
      const handle = user.codeforceshandle;
      if (!handle) continue;

      try {
        const resCF = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        const submissions = resCF.data.result;

        const problemsData = {};
        let totalSolved = 0;
        let totalAcTimeSeconds = 0;

        for (const p of problems) {
          problemsData[p.index] = {
            attempts: 0,
            verdicts: [],
            acTime: null
          };
        }

        for (const sub of submissions) {
          const { contestId: cfId, problem, verdict, creationTimeSeconds } = sub;
          if (!problem || !verdict) continue;

          const key = `${cfId}-${problem.index}`;
          const subTime = new Date(creationTimeSeconds * 1000);
          const label = problem.index;

          if (
            problemSet.has(key) &&
            subTime >= startTime &&
            (!endTime || subTime <= endTime)
          ) {
            if (!problemsData[label]) continue;

            problemsData[label].attempts++;
            problemsData[label].verdicts.push({ verdict });

            if (verdict === "OK" && problemsData[label].acTime === null) {
              problemsData[label].acTime = subTime;
              totalSolved++;
              totalAcTimeSeconds += (creationTimeSeconds - Math.floor(startTime.getTime() / 1000));
            }
          }
        }

        results.push({
         username: user.codeforceshandle,
          problemsSolved: totalSolved,
          problems: problemsData,
          acTime: totalAcTimeSeconds
        });
      } catch (err) {
        console.error(`❌ Error fetching for ${handle}:`, err.message);
      }
    }

    // Sort standings
    results.sort((a, b) => {
      if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
      if (a.acTime !== b.acTime) return a.acTime - b.acTime;
      return a.username.localeCompare(b.username);
    });

    // 💾 If contest just ended now, freeze and save standings
    if (endTime && now > endTime && contest.frozenStandings.length === 0) {
      contest.frozenStandings = results;
      await contest.save();
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Error in getStandings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getLiveContestsForUser = async (req, res) => {
   const username = req.query.username;
  const now = new Date();
    console.log("🔍 Looking up live contests for username:", username);
  try {
   const liveContests = await Contest.find({   // ✅ Mongoose model method
  "signups.username": username,
  startTime: { $lte: now },
  endTime: { $gte: now }
});

    res.json({ liveContests });
  } catch (err) {
    console.error("Error fetching live contests:", err);
    res.status(500).json({ message: "Error fetching live contests", error: err.message });
  }
};


const contestinviatation=async(req,res)=>{
   const contestId = req.params.id;
   try {
   const contest = await ContestModel.getContestById(contestId);

    if (!contest) return res.status(404).json({ message: "Contest not found" });

   const user = await User.findOne({ username: contest.createdBy });
if (!user) return res.status(404).json({ message: "User not found" });

    const friends = user.friends || []; // assuming friends = array of emails

    if (friends.length === 0) {
      return res.status(400).json({ message: "No friends to invite" });
    }

    // Send emails in parallel
    await Promise.all(
      friends.map(friendEmail =>
        sendInviteEmail(friendEmail, contest.name, contest._id, contest.startTime)
      )
    );
 return res.json({ message: "Invites sent successfully" });
  } catch (err) {
    console.error("❌ Failed to send invites:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};







module.exports = {
  createContest,
  getContestsByUser,
  signupContest,
  getSignups,
  addProblemsToContest,
  getAssignedProblems,
  assignProblems,
  getContestById,
  getStandings,
    getLiveContestsForUser,
    contestinviatation,
};
