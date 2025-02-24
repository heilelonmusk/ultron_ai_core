const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // FIX: Import di mongoose
const connectDB = require("../../config/connectMongoDB");
const walletRoutes = require("../../api/routes/walletRoutes");
const knowledgeRoutes = require("../../api/routes/knowledgeRoutes");

let server; // 🔹 Definiamo `server` a livello globale

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

// 🔹 Funzione per chiudere correttamente il server
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

// 🔹 Chiudiamo il server e MongoDB dopo i test
afterAll(async () => {
  await closeServer();
  await mongoose.connection.close(); // FIX: Corretta gestione MongoDB
});

module.exports = { getTestServer, closeServer };