const express = require("express");
const Wallet = require("../models/WalletModel");
const fs = require("fs");
const csvParser = require("csv-parser");
const router = express.Router();

// 🔐 Endpoint protetto
router.post("/protected-route", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== "valid_token") {
      console.error("❌ Unauthorized access attempt");
      return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({ message: "Access granted" });
});

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
      .pipe(csvParser({ headers: false, skipLines: 0 }))
      .on("data", (row) => {
        const walletAddress = Object.values(row).map(v => v.trim()).find(v => v.startsWith("dym"));
        if (walletAddress && walletAddress === address) {
          found = true;
        }
      })
      .on("end", () => {
        console.log(`✅ Found in whitelist: ${found}`);
        resolve(found);
      })
      .on("error", (err) => {
        console.error("❌ Error reading whitelist file:", err);
        resolve(false);
      });
  });
};

// ✅ API per controllare un wallet
router.get("/check/:address", async (req, res) => {
  try {
    console.log("🔍 Request received:", req.params);

    const { address } = req.params;

    // **🛑 Controllo sulla lunghezza massima dell'indirizzo**
    if (address.length > 255) {
      console.error("❌ Wallet address too long:", address);
      return res.status(400).json({ error: "Invalid address format" });
    }

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
    console.error("❌ Error checking wallet address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ API per ottenere tutti i wallet nel database
router.get("/all", async (req, res) => {
  try {
    const wallets = await Wallet.find({});
    return res.json(wallets);
  } catch (error) {
    console.error("❌ Error checking wallet address:", error.message || error);
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;