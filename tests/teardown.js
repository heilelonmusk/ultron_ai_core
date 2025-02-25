const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "backup.json");

module.exports = async () => {
  console.log("🛑 Jest Global Teardown: Restoring Database...");

  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB connection is not open. Skipping restore.");
    return;
  }

  if (fs.existsSync(backupPath)) {
    console.log("🔄 Restoring database...");
    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
    
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      
      for (let collection of collections) {
        const collectionName = collection.collectionName;
        if (backupData[collectionName] && backupData[collectionName].length > 0) {
          console.log(`📂 Restoring ${collectionName}...`);
          await collection.deleteMany({});
          await collection.insertMany(backupData[collectionName]);
        } else {
          console.log(`⚠️ Skipping empty collection: ${collectionName}`);
        }
      }
    } else {
      console.warn("⚠️ No database connection found. Restore skipped.");
    }

    fs.unlinkSync(backupPath);
  } else {
    console.log("⚠️ No backup file found. Skipping restore.");
  }

  console.log("🔌 Closing MongoDB connection...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed.");
};