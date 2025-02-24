const mongoose = require("mongoose");
const Wallet = require("../api/models/WalletModel");
const { importCSV } = require("../database/importCSV");
const path = require("path");
const { getTestServer } = require("./testServer");

let server;

describe("Database Sync Test", () => {
  beforeAll(async () => {
    ({ server } = await getTestServer());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
    console.log("✅ Test Server closed.");
  });

  test("Should update 'not eligible' wallets when added to whitelist", async () => {
    const filePath = path.join(__dirname, "../database/whitelist.csv");
    await importCSV(filePath, "eligible");

    const updatedWallets = await Wallet.countDocuments({ status: "eligible" });
    expect(updatedWallets).toBeGreaterThan(0);
  });
});