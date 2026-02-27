// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1. Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address (e.g., admin@tcg.com)
        pass: process.env.EMAIL_PASS, // Your 16-character App Password
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `"TaxConsultGuru Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.text, // Plain text version
      html: options.html, // HTML version
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Mailer': 'Nodemailer',
        'Importance': 'high',
      }
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;