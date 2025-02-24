const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Se già connesso, esci

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB", // 🔹 Forza il database corretto
      serverSelectionTimeoutMS: 5000, // ⏳ Timeout per evitare blocchi infiniti
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected to:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Arresta il server in caso di errore critico
  }
};

// Gestione della disconnessione in caso di errore
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Riconnessione in corso...");
  connectDB(); // Tenta di riconnettersi automaticamente
});

module.exports = connectDB;