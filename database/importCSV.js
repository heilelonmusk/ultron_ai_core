const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");

// Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// Funzione per importare CSV
const importCSV = (filePath, status) => {
  fs.createReadStream(filePath)
    .pipe(csvParser({ headers: ["address", "importedAt"] })) // Legge anche il timestamp se presente
    .on("data", async (row) => {
      try {
        if (!row.address) {
          console.error(`❌ Skipped row with missing address:`, row);
          return;
        }

        const timestamp = row.importedAt ? new Date(row.importedAt) : Date.now();

        const wallet = new Wallet({
          address: row.address.trim(),
          status,
          importedAt: timestamp
        });

        await wallet.save();
        console.log(`✅ Inserted: ${row.address} at ${timestamp}`);
      } catch (error) {
        console.error(`❌ Error inserting ${row.address}: ${error.message}`);
      }
    })
    .on("end", () => {
      console.log(`✅ Import completed for ${filePath}`);
      mongoose.connection.close();
    });
};

// Esegui l'importazione dei due file CSV
importCSV("database/whitelist.csv", "eligible");
importCSV("database/non_eligible.csv", "not eligible");