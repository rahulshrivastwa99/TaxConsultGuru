// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes("ENOTFOUND")) {
      console.error("👉 TIP: This is a DNS issue. Try changing your DNS to 8.8.8.8 or check your internet connection.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;
