const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Evitiamo doppie connessioni

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB",
      serverSelectionTimeoutMS: 30000, // ⏳ Timeout più lungo per stabilità
    });

    console.log("✅ MongoDB Connected to:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Blocchiamo la riconnessione durante i test
if (process.env.NODE_ENV !== "test") {
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected! Trying to reconnect...");
    connectDB();
  });
}

module.exports = connectDB;