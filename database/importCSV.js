const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");

// Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const parseDate = (dateString) => {
  if (!dateString) return new Date(); // Se il valore è vuoto, usa la data corrente
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

// Funzione per importare CSV
const importCSV = async (filePath, status) => {
  return new Promise((resolve, reject) => {
    const wallets = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ["address", "importedAt"] })) // Legge anche il timestamp
      .on("data", async (row) => {
        if (!row.address || !row.address.startsWith("dym1")) {
          console.error(`❌ Skipped invalid address: ${row.address}`);
          return;
        }

        const timestamp = parseDate(row.importedAt);

        // Controlla se l'indirizzo esiste già
        const existingWallet = await Wallet.findOne({ address: row.address.trim() });

        if (existingWallet) {
          // Se esiste, aggiorna solo il timestamp
          existingWallet.importedAt = timestamp;
          await existingWallet.save();
          console.log(`🔄 Updated: ${row.address}`);
        } else {
          // Se non esiste, lo inseriamo
          wallets.push({
            address: row.address.trim(),
            status,
            importedAt: timestamp
          });
        }
      })
      .on("end", async () => {
        try {
          if (wallets.length > 0) {
            await Wallet.insertMany(wallets, { ordered: false });
            console.log(`✅ Imported ${wallets.length} new addresses`);
          }
          resolve();
        } catch (error) {
          console.error(`❌ Error inserting wallets: ${error.message}`);
          reject(error);
        } finally {
          mongoose.connection.close();
          console.log("✅ MongoDB Connection Closed");
        }
      });
  });
};

// Esegui l'importazione dei due file CSV
(async () => {
  try {
    await importCSV("database/whitelist.csv", "eligible");
    await importCSV("database/non_eligible.csv", "not eligible");
  } catch (error) {
    console.error("❌ Import process failed:", error);
  }
})();