const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const getPort = require("get-port"); // 📌 Importazione corretta per CommonJS
const connectDB = require("../../config/connectMongoDB");

async function getTestServer() {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // 📌 Importazione delle route di test
  const walletRoutes = require("../../api/routes/walletRoutes");
  const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");
  app.use("/api/wallet", walletRoutes);
  app.use("/api/knowledge", knowledgeRoutes);

  const port = await getPort(); // 📌 Trova una porta libera
  const server = app.listen(port, () => {
    console.log(`🚀 Test Server running on port ${port}`);
  });

  return { app, server, port };
}

module.exports = { getTestServer };