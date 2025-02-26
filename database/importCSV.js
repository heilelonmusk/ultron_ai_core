const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");

const importCSV = async (filePath, status) => {
  try {
    await connectMongoDB();
    console.log(`🚀 Importing ${filePath} as '${status}'`);

    // 🔍 Conta gli indirizzi PRIMA dell'importazione
    const countBefore = await Wallet.countDocuments({});
    console.log(`📊 Wallets in DB before import: ${countBefore}`);

    const wallets = new Map();

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser({ headers: ["address", "importedAt"] }))
        .on("data", (row) => {
          if (!row.address || !row.address.startsWith("dym1")) {
            console.warn(`⚠️ Skipped invalid address: ${row.address}`);
            return;
          }

          const importedAt = row.importedAt && !isNaN(Date.parse(row.importedAt))
            ? new Date(row.importedAt)
            : new Date();
          
          wallets.set(row.address.trim(), { status, importedAt });
        })
        .on("end", async () => {
          console.log(`📊 Found ${wallets.size} addresses in ${filePath}`);

          try {
            if (wallets.size === 0) {
              console.log("⚠️ No valid addresses found.");
              resolve();
              return;
            }

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
                    $setOnInsert: { checkedAt: null },
                  },
                  upsert: true,
                },
              });
            }

            console.log(`🔍 Syncing ${bulkOps.length} addresses to MongoDB...`);
            await Wallet.bulkWrite(bulkOps);
            console.log("✅ Database updated successfully.");
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
  } catch (error) {
    console.error("❌ Error importing CSV:", error.message);
  }
};

// **✅ Esporta `importCSV` per essere utilizzato nei test**
module.exports = { importCSV };

// **✅ Esegui l'importazione solo se il file viene eseguito direttamente**
if (require.main === module) {
  (async () => {
    try {
      console.log("🚀 Starting import...");

      const whitelistPath = path.join(__dirname, "whitelist.csv");
      const nonEligiblePath = path.join(__dirname, "non_eligible.csv");

      if (!fs.existsSync(whitelistPath) || !fs.existsSync(nonEligiblePath)) {
        throw new Error("❌ CSV files not found. Ensure whitelist.csv and non_eligible.csv exist.");
      }

      await importCSV(whitelistPath, "eligible");
      await importCSV(nonEligiblePath, "not eligible");

      // 🔍 Conta gli indirizzi DOPO l'importazione
      const totalCount = await Wallet.countDocuments();
      console.log(`📊 Total wallets in MongoDB: ${totalCount}`);

      console.log("✅ Data synchronization completed.");
    } catch (error) {
      console.error("❌ Import process failed:", error.message);
    } finally {
      try {
        await disconnectMongoDB();
        console.log("✅ MongoDB Connection Closed");
        if (process.env.NODE_ENV !== "test") process.exit(0); // 🔄 Evita di chiudere Jest nei test
      } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    }
  })();
}