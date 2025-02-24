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
        if (row.address && row.address.trim().toLowerCase() === address.trim().toLowerCase()) {
          found = true;
        }
      })
      .on("end", () => {
        resolve(found);
      });
  });
};

router.get("/check/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.trim().toLowerCase(); // 🔹 Normalizziamo l'input
    console.log(`🔍 Checking address: ${normalizedAddress}`);

    // Controlliamo se l'indirizzo è nella whitelist
    const eligible = await isInWhitelist(normalizedAddress);
    console.log(`📌 Eligible in whitelist: ${eligible}`);

    // Cerchiamo il wallet nel database
    let wallet = await Wallet.findOne({ address: normalizedAddress });

    if (wallet) {
      console.log(`✅ Wallet found in DB: ${wallet.address}, status: ${wallet.status}`);

      // Se è nella whitelist e non è aggiornato, aggiorniamolo
      if (eligible && wallet.status !== "eligible") {
        wallet.status = "eligible";
      }

      // Aggiorniamo il timestamp della verifica
      wallet.checkedAt = new Date();
      await wallet.save();

      console.log(`🔄 Wallet updated: ${wallet.address}, new status: ${wallet.status}`);
      return res.json({ status: wallet.status, address: wallet.address, checkedAt: wallet.checkedAt });
    } else {
      console.log(`⚠️ Wallet not found in DB, creating new entry...`);

      // Se il wallet non esiste, lo creiamo con lo stato corretto
      const newWallet = new Wallet({
        address: normalizedAddress,
        status: eligible ? "eligible" : "not eligible",
        checkedAt: new Date(),
      });

      await newWallet.save();
      console.log(`✅ New wallet added: ${newWallet.address}, status: ${newWallet.status}`);

      return res.json({ status: newWallet.status, address: newWallet.address, checkedAt: newWallet.checkedAt });
    }
  } catch (error) {
    console.error("❌ Error in checkWallet:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const wallets = await Wallet.find({});
    return res.json(wallets);
  } catch (error) {
    console.error("❌ Error fetching wallets:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;