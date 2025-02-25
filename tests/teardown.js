const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "db_backup.json");

async function restoreDatabase() {
  console.log("🔄 Restoring relevant database collections...");

  try {
    await mongoose.connect(process.env.MONGO_URI, {});

    if (!fs.existsSync(backupPath)) {
      console.warn("⚠️ Backup file not found, skipping restore.");
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

    for (const collectionName in backupData) {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.deleteMany({}); // Svuota solo le collezioni testate
      await collection.insertMany(backupData[collectionName]); // Ripristina i dati originali
    }

    console.log("✅ Database restore completed.");
  } catch (error) {
    console.error("❌ Restore failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = async () => {
  console.log("🛑 Jest Global Teardown: Restoring Database...");
  await restoreDatabase();
};