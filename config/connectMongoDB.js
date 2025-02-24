const mongoose = require("mongoose");
const winston = require("winston");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fallback_db"; // Se `MONGO_URI` non è definito, usa un fallback
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

async function connectDB(retries = MAX_RETRIES) {
  if (!mongoURI || !mongoURI.includes("mongodb+srv")) {
    logger.error("❌ MONGO_URI is missing or incorrect. Ensure you're using a MongoDB Atlas URI.");
    process.exit(1);
  }

  try {
    logger.info(`🔄 Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout per la selezione del server
      socketTimeoutMS: 45000, // Timeout connessione socket
      maxPoolSize: 10, // Limita il numero di connessioni simultanee
    });
    logger.info(`✅ Connected to MongoDB Atlas at ${mongoURI}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);

    if (retries > 0) {
      logger.warn(`🔁 Retrying in ${RETRY_INTERVAL / 1000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), RETRY_INTERVAL);
    } else {
      logger.error("❌ All retry attempts failed. Exiting application.");
      process.exit(1);
    }
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected. Reconnecting...");
  connectDB();
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("🛑 MongoDB connection closed due to app termination.");
  process.exit(0);
});

module.exports = connectDB;