const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

async function sendContestReminderEmail(toEmail, contest, senderName) {
  const mailOptions = {
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `You're Invited to "${contest.name}" on CodeArena!`,
    html: `
      <h3>${contest.name}</h3>
      <p>Organized by: ${contest.orgName}</p>
      <p>Starts at: ${new Date(contest.startTime).toLocaleString()}</p>
      <a href="http://localhost:3000/join-contest.html?id=${contest._id}">Join Contest</a>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendContestReminderEmail };
