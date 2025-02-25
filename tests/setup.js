const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || "https://github.com/heilelonmusk/ultron_ai_core/backup";

/**
 * 📥 Backup Database: Salva i dati della collezione "wallets"
 * sia in locale che, opzionalmente, su un server remoto.
 */
async function backupDatabase() {
  console.log("📥 Backing up database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping backup.");
    return;
  }

  try {
    const collection = mongoose.connection.db.collection("wallets");
    const backupData = await collection.find({}).toArray();

    const backupPayload = { wallets: backupData };

    // Salva il backup in locale
    fs.writeFileSync(backupPath, JSON.stringify(backupPayload, null, 2), "utf-8");
    console.log("✅ Local backup saved.");

    // Invia il backup a un server remoto (opzionale)
    if (REMOTE_BACKUP_URL) {
      try {
        await axios.post(REMOTE_BACKUP_URL, backupPayload, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("✅ Remote backup completed.");
      } catch (error) {
        console.error("❌ Remote backup failed:", error.message);
      }
    }
  } catch (err) {
    console.error("❌ Error during database backup:", err.message);
  }
}

/**
 * 🔄 Connessione al Database di Test e avvio del backup.
 */
module.exports = async () => {
  console.log("🔄 Connecting to test database...");
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {
    });

    console.log("✅ MongoDB connection established.");
    await backupDatabase();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Esce se la connessione fallisce
  }
};