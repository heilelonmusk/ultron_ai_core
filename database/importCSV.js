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

        const importedAt = row.importedAt ? new Date(row.importedAt) : new Date();
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
};

// **🔄 Esegui l'importazione e sincronizzazione con MongoDB**
(async () => {
  try {
    console.log("🚀 Starting import...");
    await importCSV("database/whitelist.csv", "eligible");
    await importCSV("database/non_eligible.csv", "not eligible");

    const totalCount = await Wallet.countDocuments();
    console.log(`📊 Total wallets in MongoDB: ${totalCount}`);

    console.log("✅ Data synchronization completed.");
  } catch (error) {
    console.error("❌ Import process failed:", error.message);
  } finally {
    mongoose.connection.close()
      .then(() => {
        console.log("✅ MongoDB Connection Closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("❌ Error closing MongoDB connection:", err.message);
        process.exit(1);
      });
  }
})();