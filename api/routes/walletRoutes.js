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
        if (row.address && typeof row.address === "string" && row.address.trim() === address.trim()) {
          found = true;
        }
      })
      .on("end", () => {
        resolve(found);
      });
  });
};

// ✅ API per controllare un wallet
router.get("/check/:address", async (req, res) => {
  try {
    console.log("🔍 Request received:", req.params); // Debugging

    // Controlliamo se `address` è presente e valido
    if (!req.params.address || typeof req.params.address !== "string") {
      console.error("❌ Invalid address format:", req.params.address);
      return res.status(400).json({ error: "Invalid address format" });
    }

    const address = req.params.address.trim();
    console.log(`🔍 Checking address: ${address}`);

    // Controlliamo se l'indirizzo è nella whitelist
    const eligible = await isInWhitelist(address);
    console.log(`📌 Eligible in whitelist: ${eligible}`);

    // Cerchiamo il wallet nel database
    let wallet = await Wallet.findOne({ address });

    if (wallet) {
      console.log(`✅ Wallet found in DB: ${wallet.address}, status: ${wallet.status}`);

      // Se è nella whitelist e lo stato non è aggiornato, aggiorniamolo
      if (eligible && wallet.status !== "eligible") {
        wallet.status = "eligible";
        wallet.checkedAt = new Date();
        await wallet.save();
        console.log(`🔄 Wallet updated: ${wallet.address}, new status: ${wallet.status}`);
      } else {
        console.log(`✅ Wallet already up-to-date: ${wallet.address}, status: ${wallet.status}`);
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
        address,
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