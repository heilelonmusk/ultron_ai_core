const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const getPort = require("get-port");
const connectDB = require("../../config/connectMongoDB");

async function getTestServer() {
  const app = express();
  await connectDB(); // Connessione a MongoDB
  const port = await getPort(); // Trova una porta libera
  const server = createServer(app);

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`🚀 Test Server running on port ${port}`);
      resolve({ app, server, port });
    });
  });
}

module.exports = { getTestServer };