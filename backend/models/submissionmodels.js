const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  user: String,
  contestId: String,
  problemIndex: String,
  verdict: String,
  timestamp: Date
});

module.exports = mongoose.model("Submission", SubmissionSchema);
