const express = require("express");
const mongoose = require("mongoose");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

async function getPort() {
  const { default: getPort } = await import("get-port"); // ✅ Compatibile con CommonJS
  return getPort();
}

async function getTestServer() {
  const app = express();
  const port = await getPort();
  
  app.use(express.json());
  app.use("/api/wallet", walletRoutes);
  app.use("/api/knowledge", knowledgeRoutes);

  const server = app.listen(port, () => {
    console.log(`🚀 Test Server running on port ${port}`);
  });

  return { app, server, port };
}

module.exports = { getTestServer };