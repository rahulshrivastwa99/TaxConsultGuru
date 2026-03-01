const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET.trim());

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      // Failsafe: If token is valid but user was deleted from DB
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      return next(); 
    } catch (error) {
      // Log the actual error message, not the secret!
      console.error("Token Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token was found in the headers at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// Auth Middleware for Verified Users Only
const verifiedOnly = (req, res, next) => {
  // Check if user exists and their isVerified flag in MongoDB is true
  if (req.user && req.user.isVerified === true) {
    return next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Access Denied: Your email is not verified. Please verify your OTP.",
      needsVerification: true // Frontend is flag ko use karke wapas OTP screen khol sakta hai
    });
  }
};

module.exports = { protect, admin, verifiedOnly };
