const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const backupPath = path.join(__dirname, "backup.json");
const REMOTE_BACKUP_URL = process.env.REMOTE_BACKUP_URL || "https://your-server.com/api/backup";

// Funzione per ripristinare il database dal backup remoto
async function restoreDatabase() {
  console.log("🔄 Restoring database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping restore.");
    return;
  }

  let backupData;

  // Prova a recuperare il backup remoto
  try {
    const response = await axios.get(REMOTE_BACKUP_URL);
    backupData = response.data;
    console.log("✅ Remote backup retrieved.");
  } catch (error) {
    console.warn("⚠️ Failed to retrieve remote backup, falling back to local file.");
    
    if (fs.existsSync(backupPath)) {
      backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
    } else {
      console.warn("⚠️ No backup file found. Skipping restore.");
      return;
    }
  }

  const collection = mongoose.connection.db.collection("wallets");

  if (backupData?.wallets?.length) {
    await collection.deleteMany({});
    await collection.insertMany(backupData.wallets);
    console.log("✅ Database restore completed.");
  } else {
    console.warn("⚠️ No wallet data found in backup.");
  }
}

module.exports = async () => {
  await restoreDatabase();
  await mongoose.connection.close();
  console.log("🛑 Test database connection closed.");
};