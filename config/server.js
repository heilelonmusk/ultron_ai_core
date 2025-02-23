require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const walletRoutes = require("../api/routes/walletRoutes");
const knowledgeRoutes = require("../api/routes/knowledgeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/api/wallet", walletRoutes);
app.use("/api/knowledge", knowledgeRoutes);

// Server Listener
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});