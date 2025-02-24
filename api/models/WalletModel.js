const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true, lowercase: true }, // 🔹 Normalizza gli indirizzi
  status: { type: String, enum: ["eligible", "not eligible"], required: true },
  importedAt: { type: Date, default: Date.now },
  checkedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Wallet", WalletSchema);