const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  status: { type: String, enum: ["eligible", "not eligible"], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Wallet", WalletSchema);