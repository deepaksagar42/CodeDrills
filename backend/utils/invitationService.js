const User = require('../models/user');
const { Contest } = require('../models/contestmodels');

const { sendContestReminderEmail } = require('./emailService');

// ✅ For normal users: send to friends

async function sendReminderToFriends(userId, contestId) {
    console.log("🔍 Checking IDs:");
console.log("userId:", userId);
console.log("contestId:", contestId);
  const user = await User.findById(userId);
  const contest = await Contest.findById(contestId);
  if (!user || !contest) throw new Error("User or contest not found");

  const results = await Promise.allSettled(
    user.friends.map(friend =>
      sendContestReminderEmail(friend.email, contest, user.username)
    )
  );

  return results;
}

// ✅ For admin: send to all users
async function sendReminderToAllUsers(contestId, adminName) {
  const users = await User.find({}, 'email');
  const contest = await Contest.findById(contestId);
  if (!contest) throw new Error("Contest not found");

  const results = await Promise.allSettled(
    users.map(user =>
      sendContestReminderEmail(user.email, contest, adminName || "Admin")
    )
  );

  return results;
}

module.exports = { sendReminderToFriends, sendReminderToAllUsers };
