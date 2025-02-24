const express = require("express");
const net = require("net");
const mongoose = require("mongoose");

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB Connected to:", mongoose.connection.name);
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1);
    }
  }
}

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
  await connectDB(); // 🔥 Assicura la connessione a MongoDB

  const app = express();
  const port = await getFreePort(); // 🔥 Trova una porta libera dinamicamente
  const server = app.listen(port, () => console.log(`🚀 Test Server running on port ${port}`));

  return { app, server, port };
}

module.exports = { getTestServer };