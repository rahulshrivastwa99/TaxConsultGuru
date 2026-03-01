const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    pendingData: {
      name: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, required: true },
      experience: { type: Number },
      certificationDetails: { type: String },
    },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL of 10 minutes (600 seconds)
  }
);

module.exports = mongoose.model("Otp", otpSchema);
