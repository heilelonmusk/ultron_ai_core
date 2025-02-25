const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "backup.json");

beforeAll(async () => {
  console.log("🔄 Connecting to test database...");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/testdb");
  }

  console.log("📥 Backing up database...");
  const collections = await mongoose.connection.db.collections();
  let backup = {};

  for (let collection of collections) {
    const data = await collection.find({}).toArray();
    backup[collection.collectionName] = data;
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");
});