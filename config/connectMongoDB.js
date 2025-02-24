const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB",
      serverSelectionTimeoutMS: 15000, // Timeout più lungo per evitare disconnessioni rapide
    });

    console.log("✅ MongoDB Connected to:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Disabilita il reconnect durante i test
if (process.env.NODE_ENV !== "test") {
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected! Trying to reconnect...");
    connectDB();
  });
}

module.exports = connectDB;