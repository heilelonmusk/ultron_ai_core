const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("../../config/connectMongoDB");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

async function getTestServer() {
  const app = express();
  const port = 5001;  // 🔹 Forza l'uso della porta 5001

  app.use(cors());
  app.use(bodyParser.json());

  await connectDB(); // 🔹 Connessione a MongoDB

  app.use("/api/wallet", walletRoutes);
  app.use("/api/knowledge", knowledgeRoutes);

  const server = app.listen(port, () => {
    console.log(`🚀 Test Server running on port ${port}`);
  });

  return { app, server, port };
}

module.exports = { getTestServer };