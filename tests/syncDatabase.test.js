const mongoose = require("mongoose");
const Wallet = require("../api/models/WalletModel");
const { importCSV } = require("../database/importCSV");
const path = require("path");
const { getTestServer, closeServer } = require("./utils/testServer");

let server;

describe("Database Sync Test", () => {
  beforeAll(async () => {
    jest.setTimeout(30000); // ⏳ Estende il timeout per evitare problemi di esecuzione lenta
    ({ server } = await getTestServer());
  });

  afterAll(async () => {
    try {
      if (server) {
        await closeServer();
        console.log("✅ Test Server closed.");
      }
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("✅ MongoDB Connection Closed.");
      }
    } catch (error) {
      console.error("❌ Error closing connections:", error.message);
    }
  });

  test("Should update 'not eligible' wallets when added to whitelist", async () => {
    const filePath = path.join(__dirname, "../database/whitelist.csv");

    try {
      const initialCount = await Wallet.countDocuments({ status: "eligible" });

      await importCSV(filePath, "eligible");

      const updatedWallets = await Wallet.countDocuments({ status: "eligible" });

      expect(updatedWallets).toBeGreaterThan(initialCount);
    } catch (error) {
      console.error("❌ Error during test execution:", error.message);
      throw error; // Forza Jest a segnalare l'errore nel test
    }
  });
});