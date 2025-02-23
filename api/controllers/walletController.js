const Wallet = require("../models/WalletModel");

const checkWallet = async (req, res) => {
  try {
    const { address } = req.params;
    const wallet = await Wallet.findOne({ address });

    if (wallet) {
      return res.json({ status: wallet.status, address });
    } else {
      // Se il wallet non è registrato, lo aggiungiamo a "not eligible"
      const newWallet = new Wallet({ address, status: "not eligible" });
      await newWallet.save();
      return res.json({ status: "not eligible", address });
    }
  } catch (error) {
    console.error("❌ Error in checkWallet:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { checkWallet };