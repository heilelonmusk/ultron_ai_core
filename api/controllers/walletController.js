const Wallet = require("../models/WalletModel");

const checkWallet = async (req, res) => {
  try {
    const { address } = req.params;

    // Verifica se l'indirizzo è valido
    if (!address || !address.startsWith("dym1")) {
      return res.status(400).json({ error: "Invalid wallet address format" });
    }

    // Controlla se MongoDB è connesso
    if (!Wallet.db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Cerca l'indirizzo nel database
    const wallet = await Wallet.findOne({ address });

    if (wallet) {
      return res.json({ status: wallet.status, address });
    } else {
      // Se il wallet non esiste, lo registriamo come "not eligible"
      const newWallet = new Wallet({ address, status: "not eligible", importedAt: new Date() });
      await newWallet.save();
      return res.json({ status: "not eligible", address });
    }
  } catch (error) {
    console.error("❌ Error in checkWallet:", error.message);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { checkWallet };