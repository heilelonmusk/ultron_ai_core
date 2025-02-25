const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || "https://your-server.com/api/backup";

// Funzione per salvare il database in remoto
async function backupDatabase() {
  console.log("📥 Backing up database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping backup.");
    return;
  }

  const collection = mongoose.connection.db.collection("wallets");
  const backupData = await collection.find({}).toArray();

  const backupPayload = { wallets: backupData };

  // Salva il backup in locale
  fs.writeFileSync(backupPath, JSON.stringify(backupPayload, null, 2), "utf-8");

  // Invia il backup a un server remoto (opzionale)
  try {
    await axios.post(REMOTE_BACKUP_URL, backupPayload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("✅ Remote backup completed.");
  } catch (error) {
    console.error("❌ Remote backup failed:", error.message);
  }
}

module.exports = async () => {
  console.log("🔄 Connecting to test database...");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
  await backupDatabase();
};