const express = require("express");
const Wallet = require("../models/WalletModel");
const fs = require("fs");
const csvParser = require("csv-parser");
const router = express.Router();

const WHITELIST_FILE = "database/whitelist.csv";

// ✅ Funzione per verificare se un wallet è nella whitelist
const isInWhitelist = async (address) => {
  return new Promise((resolve) => {
    let found = false;
    fs.createReadStream(WHITELIST_FILE)
      .pipe(csvParser())
      .on("data", (row) => {
        if (row.address && row.address.trim() === address.trim()) {
          found = true;
        }
      })
      .on("end", () => {
        resolve(found);
      });
  });
};

// ✅ API per verificare un wallet
router.get("/check/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const eligible = await isInWhitelist(address);
    let wallet = await Wallet.findOne({ address });

    if (wallet) {
      wallet.checkedAt = new Date(); // Aggiorna solo se l'utente fa una verifica API
      if (eligible && wallet.status !== "eligible") {
        wallet.status = "eligible"; // Aggiorna a "eligible" se ora è nella whitelist
      }
      await wallet.save();
      return res.json({ status: wallet.status, address, checkedAt: wallet.checkedAt });
    } else {
      // 🔹 Se il wallet non esiste, lo aggiungiamo con lo stato corretto
      const newWallet = new Wallet({
        address,
        status: eligible ? "eligible" : "not eligible",
        checkedAt: new Date(),
      });
      await newWallet.save();
      return res.json({ status: newWallet.status, address, checkedAt: newWallet.checkedAt });
    }
  } catch (error) {
    console.error("❌ Error in checkWallet:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;