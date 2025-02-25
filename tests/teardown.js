const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || null;

/**
 * 🔄 Funzione per ripristinare il database dal backup,
 * evitando di alterare dati esterni ai test.
 */
async function restoreDatabase() {
  console.log("🔄 Restoring database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping restore.");
    return;
  }

  let backupData = {};

  // 🔄 Recupero del backup remoto
  if (REMOTE_BACKUP_URL) {
    try {
      console.log("🌐 Fetching remote backup...");
      const response = await axios.get(REMOTE_BACKUP_URL);
      backupData = response.data;
      console.log("✅ Remote backup retrieved.");
    } catch (error) {
      console.warn("⚠️ Failed to retrieve remote backup, falling back to local file.");
    }
  }

  // 🔄 Se il backup remoto non è disponibile, usa quello locale
  if (!Object.keys(backupData).length && fs.existsSync(backupPath)) {
    try {
      backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
      console.log("📁 Local backup loaded.");
    } catch (err) {
      console.error("❌ Error reading local backup:", err.message);
      return;
    }
  }

  if (!Object.keys(backupData).length) {
    console.warn("⚠️ No valid backup data found. Skipping restore.");
    return;
  }

  // 🔄 Ripristino selettivo delle collezioni
  const collectionsToRestore = ["wallets", "eligibility_check", "non_eligible_wallets"];

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

/**
 * 🛑 Chiusura della connessione al database dopo il ripristino.
 */
module.exports = async () => {
  try {
    await restoreDatabase();
    await mongoose.connection.close();
    console.log("🛑 Test database connection closed.");
  } catch (error) {
    console.error("❌ Error during teardown process:", error.message);
  }
};