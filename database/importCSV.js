const fs = require("fs");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
require("dotenv").config();
const Wallet = require("../api/models/WalletModel");

// Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// Funzione per importare CSV
const importCSV = (filePath, status) => {
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", async (row) => {
      try {
        const wallet = new Wallet({ address: row.address, status });
        await wallet.save();
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