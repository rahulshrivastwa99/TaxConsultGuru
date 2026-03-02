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
        email: "taxconsultguru@gmail.com", // The Secret Login Email
        password: hashedPassword,
        role: "admin",
      });

      console.log(
        "✅ Master Admin Created (Email: taxconsultguru@gmail.com, Pass: admin123)",
      );
    } else {
      console.log("ℹ️ Admin already exists.");
    }
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

module.exports = seedAdmin;

// Allow running directly
if (require.main === module) {
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  dotenv.config();

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB for seeding...");
      return seedAdmin();
    })
    .then(() => {
      console.log("Seeding complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
