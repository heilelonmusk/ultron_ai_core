const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Atlas Connection Successful");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB Atlas Connection Error:", error);
    process.exit(1);
  }
};

testConnection();