const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");
const connectDB = require("../config/connectMongoDB");

const importCSV = async (filePath, status) => {
  await connectDB();

  const wallets = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ["address", "importedAt"] }))
      .on("data", (row) => {
        if (!row.address || !row.address.startsWith("dym1")) {
          console.warn(`⚠️ Skipped invalid address: ${row.address}`);
          return;
        }
        wallets.set(row.address.trim(), {
          status,
          importedAt: row.importedAt ? new Date(row.importedAt) : new Date(),
        });
      })
      .on("end", async () => {
        try {
          const bulkOps = [];
          for (const [address, data] of wallets) {
            bulkOps.push({
              updateOne: {
                filter: { address },
                update: {
                  $set: {
                    status: data.status,
                    importedAt: data.importedAt,
                  },
                  $setOnInsert: { checkedAt: null }, // ❗ Non sovrascrive `checkedAt`
                },
                upsert: true,
              },
            });
          }

          if (bulkOps.length > 0) {
            console.log(`🔍 Syncing ${bulkOps.length} addresses to MongoDB...`);
            await Wallet.bulkWrite(bulkOps);
            console.log("✅ Database updated successfully.");
          } else {
            console.log("⚠️ No valid addresses found in file.");
          }
          resolve();
        } catch (error) {
          console.error(`❌ Database Error: ${error.message}`);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        reject(error);
      });
  });
};

// ✅ API per verificare un wallet e aggiornare `checkedAt`
const express = require("express");
const router = express.Router();

router.get("/check/:address", async (req, res) => {
  try {
    const { address } = req.params;
    let wallet = await Wallet.findOne({ address });

    if (wallet) {
      wallet.checkedAt = new Date();
      await wallet.save();
      return res.json({ status: wallet.status, address, checkedAt: wallet.checkedAt });
    } else {
      const newWallet = new Wallet({
        address,
        status: "not eligible",
        checkedAt: new Date(),
      });
      await newWallet.save();
      return res.json({ status: "not eligible", address, checkedAt: newWallet.checkedAt });
    }
  } catch (error) {
    console.error("❌ Error in checkWallet:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

// Esegui l'importazione e sincronizzazione con MongoDB
(async () => {
  try {
    await importCSV("database/whitelist.csv", "eligible");
    await importCSV("database/non_eligible.csv", "not eligible");
    console.log("✅ Data synchronization completed.");
  } catch (error) {
    console.error("❌ Import process failed:", error.message);
  } finally {
    mongoose.connection.close().then(() => console.log("✅ MongoDB Connection Closed"));
  }
})();