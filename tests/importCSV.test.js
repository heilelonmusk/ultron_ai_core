const mongoose = require("mongoose");
const Wallet = require("../api/models/WalletModel");
const { importCSV } = require("../database/importCSV");
const path = require("path");
const { getTestServer } = require("./testServer");

let server;

describe("CSV Import Test", () => {
  beforeAll(async () => {
    ({ server } = await getTestServer());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
    console.log("✅ Test Server closed.");
  });

  test("Should import whitelist.csv correctly", async () => {
    const filePath = path.join(__dirname, "../database/whitelist.csv");
    await importCSV(filePath, "eligible");

    const count = await Wallet.countDocuments({ status: "eligible" });
    expect(count).toBeGreaterThan(0);
  });

  test("Should import non_eligible.csv correctly", async () => {
    const filePath = path.join(__dirname, "../database/non_eligible.csv");
    await importCSV(filePath, "not eligible");

    const count = await Wallet.countDocuments({ status: "not eligible" });
    expect(count).toBeGreaterThan(0);
  });

  test("Should skip invalid addresses", async () => {
    const filePath = path.join(__dirname, "../database/invalid.csv");
    await importCSV(filePath, "eligible");

    const count = await Wallet.countDocuments({ status: "eligible" });
    expect(count).toBeGreaterThan(0);
  });
});