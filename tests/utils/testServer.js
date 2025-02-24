const express = require("express");
const mongoose = require("mongoose");
const winston = require("winston");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

const app = express();
app.use(express.json());
app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

let server;

async function startTestServer() {
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