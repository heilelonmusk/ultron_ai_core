const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

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

async function startTestServer() {
  console.log("🔄 Establishing fresh MongoDB connection...");

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
  if (server) {
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