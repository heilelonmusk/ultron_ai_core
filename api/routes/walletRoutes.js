const express = require("express");
const Wallet = require("../models/WalletModel");
const fs = require("fs");
const csvParser = require("csv-parser");
const router = express.Router();

const WHITELIST_FILE = "database/whitelist.csv";

// ✅ Funzione per verificare se un wallet è nella whitelist
const isInWhitelist = async (address) => {
  console.log("🔍 Checking whitelist file...");
  return new Promise((resolve) => {
    let found = false;
    fs.createReadStream(WHITELIST_FILE)
      .pipe(csvParser({ headers: false }))  // ❗ Modifica: non assumiamo intestazioni fisse
      .on("data", (row) => {
        console.log("📄 Row from CSV:", row);
        const walletAddress = Object.values(row)[0]; // ❗ Estrarre il primo valore
        if (walletAddress && walletAddress.trim() === address.trim()) {
          found = true;
        }
      })
      .on("end", () => {
        console.log(`✅ Found in whitelist: ${found}`);
        resolve(found);
      });
  });
};

// ✅ API per controllare un wallet
router.get("/check/:address", async (req, res) => {
  try {
    console.log("🔍 Request received:", req.params);

    // Controllo validità dell'input
    if (!req.params.address || typeof req.params.address !== "string") {
      console.error("❌ Invalid address format:", req.params.address);
      return res.status(400).json({ error: "Invalid address format" });
    }

    const address = req.params.address.trim();
    console.log(`🔍 Checking address: ${address}`);

    // Controlla se è nella whitelist
    const eligible = await isInWhitelist(address);
    console.log(`📌 Eligible in whitelist: ${eligible}`);

    // 🔹 Usa `findOneAndUpdate` per evitare duplicati e aggiornare il DB in un solo step
    const wallet = await Wallet.findOneAndUpdate(
      { address },
      { $set: { status: eligible ? "eligible" : "not eligible", checkedAt: new Date() } },
      { upsert: true, new: true }
    );

    console.log(`🔄 Wallet updated: ${wallet.address}, status: ${wallet.status}`);
    return res.json({ status: wallet.status, address: wallet.address, checkedAt: wallet.checkedAt });

  } catch (error) {
    console.error("❌ Error in checkWallet:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ API per ottenere tutti i wallet nel database
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