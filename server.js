require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/connectMongoDB");

const app = express();

// Connessione al database al caricamento del server
connectDB().then(() => console.log("✅ Database connection established")).catch(console.error);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
const walletRoutes = require("./api/routes/walletRoutes");
const knowledgeRoutes = require("./api/routes/knowledgeRoutes");

app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

// Server Listener
const PORT = process.env.PORT || 5001;

// Evita problemi di porta occupata nei test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = { app };