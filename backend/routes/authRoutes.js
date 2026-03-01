// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); 

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET.trim();
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// @desc    Register a new user (Client, CA, or Admin) & Send OTP
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, experience, certificationDetails } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP & Expiry (10 minutes)
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 4. Create User (Unverified by default)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, 
      experience: role === "ca" ? experience : undefined,
      certificationDetails: role === "ca" ? certificationDetails : undefined,
      isVerified: false, 
      otp,
      otpExpires
    });

    // 5. Send OTP Email (NESTED TRY-CATCH FIX)
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Welcome to TaxConsultGuru!</h2>
          <p>Hi ${user.name},</p>
          <p>Your OTP for account verification is: <strong style="font-size: 24px; color: #4f46e5;">${otp}</strong></p>
          <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `;
      const text = `Welcome to TaxConsultGuru! \n\nHi ${user.name}, \n\nYour OTP for account verification is: ${otp} \n\nThis OTP is valid for 10 minutes.`;

      await sendEmail({
        email: user.email,
        subject: "TaxConsultGuru - Verify Your Account",
        html,
        text
      });

      res.status(201).json({
        message: "Registration successful. Please check your email for the OTP.",
        email: user.email,
        role: user.role
      });
    } catch (emailError) {
      console.error("Gmail SMTP Error during registration:", emailError);
      // Failsafe: Frontend processing ruk jayega aur error dikhega
      return res.status(500).json({ 
        message: "Account created but failed to send OTP email due to server error. Please try logging in to resend OTP." 
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    // 1. Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      
      // 2. Role Verification
      if (role && user.role !== role) {
        return res.status(401).json({ 
          message: `Access denied. This account is registered as a ${user.role}, but you are trying to log in to the ${role} portal.` 
        });
      }

      // 3. Status Verification: BLOCK login if NOT verified
      if (!user.isVerified) {
        const newOtp = generateOTP();
        user.otp = newOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; 
        await user.save();

        // Send Email (NESTED TRY-CATCH FIX)
        try {
          const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #4f46e5;">Verify Your Account</h2>
              <p>Hi ${user.name},</p>
              <p>It seems you haven't verified your email yet. Your new OTP for account verification is: <strong style="font-size: 24px; color: #4f46e5;">${newOtp}</strong></p>
              <p>This OTP is valid for 10 minutes.</p>
            </div>
          `;
          const text = `Verify Your Account \n\nHi ${user.name}, \n\nYour new OTP for account verification is: ${newOtp}`;

          await sendEmail({ email: user.email, subject: "TaxConsultGuru - Verify Your Account", html, text });

          return res.status(403).json({ 
            message: "Email not verified. A new OTP has been sent. Please verify your OTP to continue.",
            email: user.email 
          });
        } catch (emailError) {
          console.error("Gmail SMTP Error during login OTP resend:", emailError);
          return res.status(500).json({ 
            message: "Email not verified, and the server failed to send a new OTP. Please try again later." 
          });
        }
      }

      // 4. Direct login
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
        message: "Login successful!"
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify OTP and issue JWT Token
// @route   POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    if (user.role !== "ca") {
      user.isVerified = true;
    }
    await user.save();

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: "Authentication successful!"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;