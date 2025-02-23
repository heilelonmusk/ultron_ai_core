const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");

// Funzione per connettersi a MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Se è già connesso, non riconnetterti
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1); // Termina il processo se non può connettersi
  }
};

// Funzione per verificare il formato della data
const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

// Funzione per importare CSV
const importCSV = async (filePath, status) => {
  await connectDB(); // Assicura che la connessione sia attiva

  const wallets = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ["address", "importedAt"] }))
      .on("data", (row) => {
        if (!row.address || !row.address.startsWith("dym1")) {
          console.error(`❌ Skipped invalid address: ${row.address}`);
          return;
        }

        wallets.push({
          address: row.address.trim(),
          status,
          importedAt: parseDate(row.importedAt),
        });
      })
      .on("end", async () => {
        try {
          for (let wallet of wallets) {
            await Wallet.updateOne(
              { address: wallet.address },
              { $set: { status: wallet.status, importedAt: wallet.importedAt } },
              { upsert: true } // Se non esiste, lo crea
            );
            console.log(`✅ Processed: ${wallet.address}`);
          }
          resolve();
        } catch (error) {
          console.error(`❌ Database Error: ${error.message}`);
          reject(error);
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
  } finally {
    mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed");
  }
})();