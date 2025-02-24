const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("../../config/connectMongoDB");

// 📌 Workaround per importare get-port in CommonJS
const getPort = require("get-port");

async function getTestServer() {
  const app = express();
  const port = await getPort(); // 📌 Ottiene una porta libera

  app.use(cors());
  app.use(bodyParser.json());

  await connectDB();

  const server = app.listen(port, () => {
    console.log(`🚀 Test Server running on port ${port}`);
  });

  return { app, server, port };
}

module.exports = { getTestServer };