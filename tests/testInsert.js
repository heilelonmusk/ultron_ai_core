const mongoose = require("mongoose");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");
const connectDB = require("../config/connectMongoDB");

(async () => {
  await connectDB();
  console.log("🔍 Inserting test wallet...");

  await Wallet.create({
    address: "dym1manualtest",
    status: "eligible",
    importedAt: new Date()
  });

  console.log("✅ Test wallet inserted!");
  const count = await Wallet.countDocuments();
  console.log(`📊 Total wallets in DB: ${count}`);

  mongoose.connection.close();
})();