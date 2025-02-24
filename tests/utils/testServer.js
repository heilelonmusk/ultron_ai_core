const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require("../../config/connectMongoDB");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

let server;

async function getTestServer() {
  if (server) {
    console.log("⚠️ Closing existing server before starting a new one...");
    await closeServer();
  }

  const app = express();
  const port = 5001;

  app.use(cors());
  app.use(bodyParser.json());

  await connectDB();

  app.use("/api/wallet", walletRoutes);
  app.use("/api/knowledge", knowledgeRoutes);

  server = app.listen(port, () => {
    console.log(`🚀 Test Server running on port ${port}`);
  });

  return { app, server, port };
}

const closeServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log("✅ Test Server closed.");
        resolve();
      });
    } else {
      resolve();
    }
  });
};

afterAll(async () => {
  await closeServer();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed.");
  }
});

module.exports = { getTestServer, closeServer };