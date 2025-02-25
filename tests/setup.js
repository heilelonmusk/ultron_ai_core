const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || null;

/**
 * 📥 Backup Database: Salva i dati solo delle collezioni pertinenti ai test,
 * evitando di toccare i dati globali del database.
 */
async function backupDatabase() {
  console.log("📥 Backing up database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping backup.");
    return;
  }

  try {
    // 🔄 Collezioni usate nei test (da espandere in futuro)
    const collectionsToBackup = ["wallets", "eligibility_check", "non_eligible_wallets"]; 
    let backupPayload = {};

    for (const collectionName of collectionsToBackup) {
      const collection = mongoose.connection.db.collection(collectionName);
      const data = await collection.find({}).toArray();
      backupPayload[collectionName] = data;
    }

    // Salva backup in locale
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
    await mongoose.connect(process.env.MONGO_URI, {});

    console.log("✅ MongoDB connection established.");
    await backupDatabase();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Esce se la connessione fallisce
  }
};