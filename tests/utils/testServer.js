const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

// ✅ Importa le route
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Health Check Route (necessaria per i test)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ API Routes
app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

let server;
const backupPath = path.join(__dirname, "backup.json");

async function backupDatabase() {
  console.log("📥 Backing up database...");
  if (mongoose.connection.readyState !== 1) {
    console.log("⚠️ MongoDB connection is not open. Skipping backup.");
    return;
  }

  try {
    const collections = await mongoose.connection.db.collections();
    let backup = {};

    for (let collection of collections) {
      const data = await collection.find({}).toArray();
      backup[collection.collectionName] = data;
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");
    console.log("✅ Database backup completed.");
  } catch (error) {
    console.error("❌ Error during database backup:", error);
  }
}

async function restoreDatabase() {
  console.log("🔄 Restoring database...");

  if (!fs.existsSync(backupPath)) {
    console.log("⚠️ No backup file found. Skipping restore.");
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    console.log("🔄 Reconnecting to MongoDB for restore...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
  }

  try {
    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      const collectionName = collection.collectionName;
      if (backupData[collectionName] && backupData[collectionName].length > 0) {
        await collection.deleteMany({});
        await collection.insertMany(backupData[collectionName]);
      } else {
        console.log(`⚠️ Skipping restore for empty collection: ${collectionName}`);
      }
    }

    fs.unlinkSync(backupPath);
    console.log("✅ Database restore completed.");
  } catch (error) {
    console.error("❌ Error during database restore:", error);
  }
}

async function startTestServer() {
  console.log("🔄 Establishing fresh MongoDB connection...");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
  }

  console.log("✅ MongoDB connected.");
  await backupDatabase();

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      console.log(`🚀 Test Server running on port ${server.address().port}`);
      resolve({ app, server });
    });
  });
}

async function closeTestServer() {
  if (server) {
    await restoreDatabase();

    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error("❌ Error closing test server:", err);
          return reject(err);
        }
        console.log("✅ Test Server closed.");
        resolve();
      });
    });
  }
}

module.exports = { startTestServer, closeTestServer };