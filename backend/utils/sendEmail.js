// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1. Create a transporter with STRICT host configuration (IPv6 fix)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // 'service: "Gmail"' ki jagah direct host daalo
      port: 465,              // Secure port
      secure: true,           // 465 ke liye true hona chahiye
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
      // Yeh network/TLS issues ko bypass karne mein help karta hai
      tls: {
        rejectUnauthorized: false
      }
    });

    // 2. Define the email options
    const mailOptions = {
      from: `"TaxConsultGuru Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.text, 
      html: options.html, 
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${options.email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;