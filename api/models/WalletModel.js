const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  status: { type: String, enum: ["eligible", "not eligible"], required: true },
  importedAt: { type: Date, default: Date.now }, // Timestamp di importazione
  checkedAt: { type: Date, default: null }, // 🔹 Timestamp dell'ultima verifica
});

module.exports = mongoose.model("Wallet", WalletSchema);