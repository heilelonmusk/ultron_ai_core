require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { connectMongoDB, disconnectMongoDB } = require("./config/connectMongoDB");

const app = express();

// 🔄 Connessione a MongoDB all'avvio del server
(async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongoDB();
    console.log("✅ MongoDB connected.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Se non può connettersi, il server non parte
  }
})();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ API Routes
const walletRoutes = require("./api/routes/walletRoutes");
const knowledgeRoutes = require("./api/routes/knowledgeRoutes");

app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

// 🛑 Graceful Shutdown (Chiude il DB quando il server viene terminato)
process.on("SIGINT", async () => {
  console.log("🛑 Closing MongoDB connection...");
  await disconnectMongoDB();
  process.exit(0);
});

// 🚀 Avvio server sulla porta specificata
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;