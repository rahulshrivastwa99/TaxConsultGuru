// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "ca", "admin"], // Strict roles
      required: true,
    },
    // Add these to your existing User schema
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }, // For CA verification
    experience: { type: Number }, // Experience for CAs
    certificationDetails: { type: String }, // Certification details for CAs
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
