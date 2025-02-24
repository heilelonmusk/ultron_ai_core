const mongoose = require("mongoose");
const winston = require("winston");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fallback_db"; 
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 50000;

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

// ✅ Connessione a MongoDB con gestione degli errori
async function connectMongoDB(retries = MAX_RETRIES) {
  if (mongoose.connection.readyState === 1) {
    logger.info("✅ MongoDB is already connected.");
    return;
  }

  if (!mongoURI || !mongoURI.includes("mongodb+srv")) {
    logger.error("❌ MONGO_URI is missing or incorrect.");
    process.exit(1);
  }

  try {
    logger.info("🔄 Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 100000, 
      socketTimeoutMS: 100000,
      connectTimeoutMS: 100000,
    });
    logger.info(`✅ Connected to MongoDB Atlas at ${mongoURI}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    
    if (retries > 0) {
      logger.warn(`🔁 Retrying in ${RETRY_INTERVAL / 10000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectMongoDB(retries - 1), RETRY_INTERVAL);
    } else {
      logger.error("❌ All retry attempts failed. Exiting.");
      process.exit(1);
    }
  }
}

// ✅ Disconnessione controllata
async function disconnectMongoDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("🛑 MongoDB connection closed.");
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected. Reconnecting...");
  setImmediate(connectMongoDB);
});

process.on("SIGINT", async () => {
  await disconnectMongoDB();
  process.exit(0);
});

module.exports = { connectMongoDB, disconnectMongoDB };