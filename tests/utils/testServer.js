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

const backupPath = path.join(__dirname, "db_backup.json");

async function backupDatabase() {
  console.log("📥 Backing up database...");

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
    }

    const collectionsToBackup = ["wallets", "non_eligible"];
    let backupData = {};

    for (const collectionName of collectionsToBackup) {
      const collection = mongoose.connection.db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      backupData[collectionName] = documents;
    }

    // ✅ Verifica che il backup non sia vuoto prima di salvarlo
    if (Object.values(backupData).some((docs) => docs.length > 0)) {
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log("✅ Database backup completed.");
    } else {
      console.warn("⚠️ No relevant data found for backup, skipping.");
    }
  } catch (error) {
    console.error("❌ Database backup failed:", error);
  }
}

async function restoreDatabase() {
  console.log("🔄 Restoring database...");

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
    }

    if (!fs.existsSync(backupPath)) {
      console.warn("⚠️ No backup found, skipping restore.");
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

    for (const collectionName in backupData) {
      const collection = mongoose.connection.db.collection(collectionName);

      // ✅ Evita di cancellare dati reali se il backup è vuoto o incompleto
      if (backupData[collectionName].length > 0) {
        await collection.deleteMany({});
        await collection.insertMany(backupData[collectionName]);
      } else {
        console.warn(`⚠️ Skipping restore for empty collection: ${collectionName}`);
      }
    }

    console.log("✅ Database restore completed.");
  } catch (error) {
    console.error("❌ Database restore failed:", error);
  }
}

let server;

async function startTestServer() {
  console.log("🔄 Establishing fresh MongoDB connection...");

  await backupDatabase();

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
  }

  console.log("✅ MongoDB connected.");

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      console.log(`🚀 Test Server running on port ${server.address().port}`);
      resolve({ app, server });
    });
  });
}

async function closeTestServer() {
  console.log("🛑 Closing test server...");
  
  if (server) {
    return new Promise((resolve, reject) => {
      server.close(async (err) => {
        if (err) {
          console.error("❌ Error closing test server:", err);
          return reject(err);
        }

        console.log("🔄 Restoring database...");
        await restoreDatabase();
        console.log("✅ Test Server closed.");
        resolve();
      });
    });
  }
}

module.exports = { startTestServer, closeTestServer };