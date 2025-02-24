const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) return; // Evita di connetterti se già connesso

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB", 
      serverSelectionTimeoutMS: 10000, // Evita timeout lunghi
    });

    console.log("✅ MongoDB Connected to:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Evento per riconnessione in caso di perdita di connessione
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Riconnessione in corso...");
  connectDB();
});

module.exports = connectDB;