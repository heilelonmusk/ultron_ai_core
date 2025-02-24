const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Se già connesso, esci
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB", // 🔹 Forza il database corretto
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;