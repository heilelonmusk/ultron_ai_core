const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const backupPath = path.join(__dirname, "db_backup.json");

async function backupDatabase() {
  console.log("📥 Backing up relevant database collections...");

  try {
    await mongoose.connect(process.env.MONGO_URI, {});

    const collectionsToBackup = ["wallets", "non_eligible"]; // Solo le collezioni rilevanti per i test
    let backupData = {};

    for (const collectionName of collectionsToBackup) {
      const collection = mongoose.connection.db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      backupData[collectionName] = documents;
    }

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log("✅ Backup completed.");
  } catch (error) {
    console.error("❌ Backup failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = async () => {
  console.log("🔄 Connecting to test database...");
  await backupDatabase();
};