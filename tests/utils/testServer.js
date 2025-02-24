const express = require("express");
const getPort = require("get-port-sync"); // ✅ Usa la versione compatibile con CommonJS

async function getTestServer() {
  const app = express();
  const port = getPort(); // ✅ Trova una porta libera
  const server = app.listen(port, () => console.log(`🚀 Test Server running on port ${port}`));

  return { app, server, port };
}

module.exports = { getTestServer };