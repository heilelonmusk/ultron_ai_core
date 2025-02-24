const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // ✅ Evita connessioni duplicate

  try {
    // 🔹 Connettiamo forzatamente ad Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB",  // 🔹 Forza il database corretto su Atlas
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // ⏳ Timeout esteso per connessioni lente
    });

    console.log("✅ Connected to MongoDB Atlas:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ MongoDB Atlas Connection Failed:", err.message);
    process.exit(1); // 🚨 Se fallisce, termina il processo
  }
};

// 🔄 Evita riconnessioni automatiche in modalità test
if (process.env.NODE_ENV !== "test") {
  mongoose.connection.on("disconnected", async () => {
    console.warn("⚠️ MongoDB Disconnected! Reconnecting...");
    await connectDB();
  });
}

module.exports = connectDB;