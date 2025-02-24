// tests/teardown.js
const mongoose = require("mongoose");

module.exports = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed.");
    } else {
      console.log("⚠️ No active MongoDB connection to close.");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error.message);
  }
};