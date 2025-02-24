require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Tempo massimo di attesa prima di un errore
      connectTimeoutMS: 10000, // Timeout per la connessione iniziale
      socketTimeoutMS: 20000, // Evita timeout di lettura/scrittura
    });

    console.log("✅ MongoDB Atlas Connection Successful");

    // Controllo stato connessione e chiusura pulita
    if (mongoose.connection.readyState === 1) {
      console.log("🔌 Closing MongoDB connection...");
      await mongoose.connection.close();
      console.log("✅ MongoDB Connection Closed");
    }
  } catch (error) {
    console.error("❌ MongoDB Atlas Connection Error:", error.message);
    process.exit(1);
  }
};

// Avvia il test
testConnection();