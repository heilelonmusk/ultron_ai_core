require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./config/connectMongoDB");

const app = express();

// Connessione a MongoDB
(async () => {
  await connectDB();
})();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
const walletRoutes = require("./api/routes/walletRoutes");
const knowledgeRoutes = require("./api/routes/knowledgeRoutes");

app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

// 🔹 Forziamo la porta su 5001
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;