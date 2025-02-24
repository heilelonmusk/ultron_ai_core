const express = require("express");
const net = require("net");

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", (err) => reject(err));
  });
}

async function getTestServer() {
  const app = express();
  const port = await getFreePort(); // 🔥 Trova una porta libera dinamicamente
  const server = app.listen(port, () => console.log(`🚀 Test Server running on port ${port}`));

  return { app, server, port };
}

module.exports = { getTestServer };