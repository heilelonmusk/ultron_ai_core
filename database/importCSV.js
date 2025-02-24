const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");

// Funzione per connettersi a MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Se già connesso, esci
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "heilelonDB", // 🔹 Forza il database corretto
      serverSelectionTimeoutMS: 5000, // Timeout ridotto per connessione più reattiva
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Funzione per verificare il formato della data
const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const timestamp = Date.parse(dateString);
  if (isNaN(timestamp)) {
    console.warn(`⚠️ Invalid date format: ${dateString}. Using current timestamp.`);
    return new Date();
  }
  return new Date(timestamp);
};

// Funzione per importare CSV in bulk
const importCSV = async (filePath, status) => {
  await connectDB(); // Assicura connessione attiva

  return new Promise((resolve, reject) => {
    const wallets = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ["address", "importedAt"] }))
      .on("data", (row) => {
        if (!row.address || !row.address.startsWith("dym1")) {
          console.warn(`⚠️ Skipped invalid address: ${row.address}`);
          return;
        }

        wallets.push({
          updateOne: {
            filter: { address: row.address.trim() },
            update: {
              $set: { status, importedAt: parseDate(row.importedAt) },
            },
            upsert: true, // Se non esiste, lo crea
          },
        });
      })
      .on("end", async () => {
        try {
          if (wallets.length > 0) {
            console.log(`🔍 Attempting to write ${wallets.length} documents to MongoDB...`);
            const result = await Wallet.bulkWrite(wallets);
            console.log(`✅ Imported ${wallets.length} addresses successfully!`);
          } else {
            console.log(`⚠️ No valid addresses found in ${filePath}`);
          }
          resolve();
        } catch (error) {
          console.error(`❌ Database Error in ${filePath}: ${error.message}`);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        reject(error);
      });
  });
};

// Esegui l'importazione dei CSV
(async () => {
  try {
    await importCSV("database/whitelist.csv", "eligible");
    await importCSV("database/non_eligible.csv", "not eligible");

    // 🔍 Dopo l'importazione, stampiamo il numero totale di documenti
    const total = await Wallet.countDocuments();
    console.log(`📊 Total wallets in database: ${total}`);
  } catch (error) {
    console.error("❌ Import process failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed");
  }
})();