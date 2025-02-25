const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || "https://github.com/heilelonmusk/ultron_ai_core/backup";

// Funzione per ripristinare il database dal backup senza alterare dati esterni ai test
async function restoreDatabase() {
  console.log("🔄 Restoring database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping restore.");
    return;
  }

  let backupData = {};

  // Prova a recuperare il backup remoto
  try {
    console.log("🌐 Fetching remote backup...");
    const response = await axios.get(REMOTE_BACKUP_URL);
    backupData = response.data;
    console.log("✅ Remote backup retrieved.");
  } catch (error) {
    console.warn("⚠️ Failed to retrieve remote backup, falling back to local file.");
    
    if (fs.existsSync(backupPath)) {
      try {
        backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
        console.log("📁 Local backup loaded.");
      } catch (err) {
        console.error("❌ Error reading local backup:", err);
        return;
      }
    } else {
      console.warn("⚠️ No backup file found. Skipping restore.");
      return;
    }
  }

  // Ripristino selettivo delle collezioni
  const collectionsToRestore = ["wallets"];

  for (const collectionName of collectionsToRestore) {
    const collection = mongoose.connection.db.collection(collectionName);

    if (backupData[collectionName] && Array.isArray(backupData[collectionName]) && backupData[collectionName].length) {
      console.log(`🔄 Restoring collection: ${collectionName}...`);

      await collection.deleteMany({});
      await collection.insertMany(backupData[collectionName]);

      console.log(`✅ ${collectionName} restore completed.`);
    } else {
      console.warn(`⚠️ No valid data found for collection: ${collectionName}. Skipping.`);
    }
  }
}

module.exports = async () => {
  try {
    await restoreDatabase();
    await mongoose.connection.close();
    console.log("🛑 Test database connection closed.");
  } catch (error) {
    console.error("❌ Error during teardown process:", error);
  }
};