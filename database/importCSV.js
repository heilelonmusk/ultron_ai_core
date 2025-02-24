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

        wallets.set(row.address.trim(), {
          status,
          importedAt,
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
                  $setOnInsert: { checkedAt: null }, // Non sovrascrive checkedAt se già esiste
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

          // **🔄 Attendi che MongoDB aggiorni i dati prima di chiudere**
          await new Promise((resolve) => setTimeout(resolve, 2000));

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

    const eligibleCount = await Wallet.countDocuments({ status: "eligible" });
    console.log(`📊 Total eligible addresses in MongoDB: ${eligibleCount}`);

    await importCSV("database/non_eligible.csv", "not eligible");

    const notEligibleCount = await Wallet.countDocuments({ status: "not eligible" });
    console.log(`📊 Total not eligible addresses in MongoDB: ${notEligibleCount}`);

    console.log("✅ Data synchronization completed.");
  } catch (error) {
    console.error("❌ Import process failed:", error.message);
  } finally {
    await mongoose.connection.close()
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