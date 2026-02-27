// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // Make sure you created this file!

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate JWT (Your original logic)
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET.trim();
  console.log(`🎲 Generating token with secret length: ${secret.length}`);
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

    // 5. Send OTP Email
    if (user) {
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

      const text = `Welcome to TaxConsultGuru! \n\nHi ${user.name}, \n\nYour OTP for account verification is: ${otp} \n\nThis OTP is valid for 10 minutes. Please do not share it with anyone.`;

      await sendEmail({
        email: user.email,
        subject: "TaxConsultGuru - Verify Your Account",
        html,
        text
      });

      // NOTE: We do NOT send the token here anymore. 
      // We just tell the frontend to move to the OTP screen.
      res.status(201).json({
        message: "Registration successful. Please check your email for the OTP.",
        email: user.email,
        role: user.role
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
      
      // 2. Role Verification: Ensure user is logging into the correct portal
      if (role && user.role !== role) {
        return res.status(401).json({ 
          message: `Access denied. This account is registered as a ${user.role}, but you are trying to log in to the ${role} portal.` 
        });
      }

      // Direct login: Return token and user data
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// @desc    Verify OTP and issue JWT Token (For both Login & Register)
// @route   POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if OTP matches and hasn't expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP is valid - Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Now we finally send the token and user data to the frontend
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: "Authentication successful!"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;