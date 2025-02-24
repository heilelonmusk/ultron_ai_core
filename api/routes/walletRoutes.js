const express = require("express");
const Wallet = require("../models/WalletModel");
const fs = require("fs");
const csvParser = require("csv-parser");
const router = express.Router();

const WHITELIST_FILE = "database/whitelist.csv";

// ✅ Funzione per validare gli indirizzi Cosmos (Dymension)
const isValidAddress = (address) => {
  // Accetta solo indirizzi che iniziano con 'dym' seguiti da almeno 5 caratteri alfanumerici
  const regex = /^dym[0-9a-zA-Z]{5,}$/;
  return regex.test(address);
};

// ✅ Funzione per verificare se un wallet è nella whitelist
const isInWhitelist = async (address) => {
  console.log("🔍 Checking whitelist file...");
  return new Promise((resolve) => {
    let found = false;
    fs.createReadStream(WHITELIST_FILE)
      .pipe(csvParser({ headers: false, skipLines: 0 })) // Ignora intestazioni e righe vuote
      .on("data", (row) => {
        const walletAddress = Object.values(row)[0]?.trim(); // Estrai il primo valore della riga
        if (walletAddress === address) {
          found = true;
        }
      })
      .on("end", () => {
        console.log(`✅ Found in whitelist: ${found}`);
        resolve(found);
      })
      .on("error", (err) => {
        console.error("❌ Error reading whitelist file:", err);
        resolve(false); // In caso di errore, consideriamo l'indirizzo come "non idoneo"
      });
  });
};

// ✅ API per controllare un wallet
router.get("/check/:address", async (req, res) => {
  try {
    console.log("🔍 Request received:", req.params);

    const { address } = req.params;

    // **🔍 Verifica se l'indirizzo è valido**
    if (!isValidAddress(address)) {
      console.error("❌ Invalid address format:", address);
      return res.status(400).json({ error: "Invalid address format" });
    }

    console.log(`🔍 Checking address: ${address}`);

    // **🔍 Controlla se è nella whitelist**
    const eligible = await isInWhitelist(address);
    console.log(`📌 Eligible in whitelist: ${eligible}`);

    // **🔍 Controlla se è già nel DB**
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