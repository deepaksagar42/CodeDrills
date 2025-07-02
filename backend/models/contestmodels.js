const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  name: String,
  startTime: Date,
  endTime: Date,
  noEnd: Boolean,
  orgType: String,
  orgName: String,
  createdBy: String,
  createdAt: Date,
 signups: [
  {
    username: String,
    email: String,
    codeforceshandle: String,
    joinedAt: Date
  }
],
  problems: [
    {
      contestId: Number,
      index: String,
      name: String,
      rating: Number,
      tags: [String],
    },
  ],
  frozenStandings: {
  type: Array,
  default: [],
},

});

const Contest = mongoose.model("Contest", contestSchema);

// Create
const createContest = async (data) => {
  const contest = new Contest(data);
  return await contest.save();
};

// Get all contests by a user
const getContestsByUser = async (username) => {
  return await Contest.find({ createdBy: username });
};

const signupContest = async (id, username, email,codeforceshandle) => {
  const contest = await Contest.findById(id);
  const alreadySignedUp = contest.signups.some(u => u.username === username);
  console.log("📥 Signup data received:", { username, email, codeforceshandle });

  if (!alreadySignedUp) {
    contest.signups.push({
      username,
      email,
      codeforceshandle,
      joinedAt: new Date()
    });
    await contest.save();
  }

  return { message: "Signup successful" };
};


// Get all signups for a contest
const getSignups = async (id) => {
  const contest = await Contest.findById(id);
  return contest.signups || [];
};

// Get contest stats
const getStats = async (id) => {
  const contest = await Contest.findById(id);
  return {
    totalSignups: contest.signups.length,
    totalProblems: contest.problems.length,
  };
};

// Add multiple problems
const addProblems = async (id, problems) => {
  const validProblems = problems.filter(p => p && p.contestId && p.index);
  const contest = await Contest.findById(id);
  contest.problems.push(...validProblems);
  await contest.save();
  return { message: "Problems added successfully" };
};

// Assign single problem
const assignProblem = async (id, problem) => {
  if (!problem || !problem.contestId || !problem.index) {
    throw new Error("Invalid problem data");
  }
  const contest = await Contest.findById(id);
  contest.problems.push(problem);
  await contest.save();
  return { message: "Problem assigned successfully" };
};
// Get problems
const getProblems = async (id) => {
  const contest = await Contest.findById(id);
  return contest.problems || [];
};

// Get contest by ID
const getContestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid contest ID");
  }
  return await Contest.findById(id);
};


module.exports = {
  Contest,
  createContest,
  getContestsByUser,
  signupContest,
  getSignups,
  getStats,
  addProblems,
  assignProblem,
  getProblems,
   getContestById, 
};
