// backend/seeder.js
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    // Check if ANY admin exists
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      // Create the Master Admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt); // Default Password

      await User.create({
        name: "Master Admin",
        email: "admin@tcg.com", // The Secret Login Email
        password: hashedPassword,
        role: "admin",
      });

      console.log(
        "✅ Master Admin Created (Email: master@tcg.com, Pass: admin123)",
      );
    }
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

module.exports = seedAdmin;
