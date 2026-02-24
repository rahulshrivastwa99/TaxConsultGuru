// backend/verify_certification.js
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const verifyCertification = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for verification");

    const testCA = {
      name: "Certification Test CA",
      email: `test_ca_cert_${Date.now()}@example.com`,
      password: "password123",
      role: "ca",
      experience: 10,
      certificationDetails: "CA Final (ICAI), GST Practitioner Certificate #12345",
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testCA.password, salt);

    const user = await User.create({
      ...testCA,
      password: hashedPassword,
      isVerified: false,
    });

    console.log("Created CA with Certification Details:", user);

    if (user.certificationDetails === testCA.certificationDetails) {
      console.log("✅ Verification Successful: certificationDetails correctly saved.");
    } else {
      console.error("❌ Verification Failed: certificationDetails mismatch.");
    }

    // Clean up
    await User.findByIdAndDelete(user._id);
    console.log("Cleaned up test user.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Verification Error:", error);
    process.exit(1);
  }
};

verifyCertification();
