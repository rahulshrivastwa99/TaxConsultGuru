// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user (Client, CA, or Admin)
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, experience, certificationDetails } = req.body;

  try {
    // 1. SECURITY CHECK REMOVED: Allowed Admin registration for Dashboard functionality
    // if (role === "admin") { ... }  <-- Ye hata diya hai

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // Ab ye 'admin' role bhi accept karega
      experience: role === "ca" ? experience : undefined,
      certificationDetails: role === "ca" ? certificationDetails : undefined,
      isVerified: false, // Ensure all new users (especially CAs) start as unverified
    });

    // 5. Send Response (with Token)
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login User (Client, CA, or Admin)
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check password
    if (user && (await bcrypt.compare(password, user.password))) {
      // Optional: Update online status here if needed in future
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET.trim();
  console.log(`🎲 Generating token with secret length: ${secret.length}`);
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

module.exports = router;