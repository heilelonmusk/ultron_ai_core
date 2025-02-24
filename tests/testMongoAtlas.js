require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
      serverSelectionTimeoutMS: 10000, // Tempo massimo di attesa prima di un errore
    });

    console.log("✅ MongoDB Atlas Connection Successful");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ MongoDB Atlas Connection Error:", error.message);
    process.exit(1);
  }
};

testConnection();