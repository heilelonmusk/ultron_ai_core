const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require("../../config/connectMongoDB");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

async function getTestServer() {
  const app = express();
  const PORT = 5001; // 🔹 Porta fissa

  app.use(cors());
  app.use(bodyParser.json());

  await connectDB(); // Connessione a MongoDB

  app.use("/api/wallet", walletRoutes);
  app.use("/api/knowledge", knowledgeRoutes);

  const server = app.listen(PORT, () => {
    console.log(`✅ Test Server running on port ${PORT}`);
  });

  return { app, server, port: PORT };
}

module.exports = { getTestServer };