const mongoose = require("mongoose");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");
const connectDB = require("../config/connectMongoDB");

(async () => {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("❌ MongoDB connection failed.");
    }

    console.log("🔍 Inserting test wallet...");

    await Wallet.create({
      address: "dym1manualtest",
      status: "eligible",
      importedAt: new Date(),
    });

    console.log("✅ Test wallet inserted!");
    
    const count = await Wallet.countDocuments();
    console.log(`📊 Total wallets in DB: ${count}`);

  } catch (error) {
    console.error("❌ Error during test wallet insertion:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed.");
    }
  }
})();