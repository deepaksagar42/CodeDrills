const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ← your Gmail App Password
  },
});

async function sendInviteEmail(to, contestName, contestId, startTime) {
    console.log("📧 sendInviteEmail type:", typeof sendInviteEmail); // should be "function"

  const formattedDate = new Date(startTime).toLocaleString();

  const mailOptions = {
    from: `"Codearena" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `⏰ You're invited to join contest: ${contestName}`,
    html: `
      <p>Hey coder 👋,</p>
      <p>Your friend has invited you to join the <strong>${contestName}</strong> contest on <strong>Codearena</strong>.</p>
      <p><b>Start Time:</b> ${formattedDate}</p>
      <p>
        <a href="https://yourdomain.com/joincontest.html?id=${contestId}" 
           style="background:#1D4ED8; color:white; padding:10px 15px; text-decoration:none; border-radius:6px;">
          🔗 Join Contest Now
        </a>
      </p>
      <p>Happy coding! 🚀</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendInviteEmail };
