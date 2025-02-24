const mongoose = require("mongoose");
const Wallet = require("../api/models/WalletModel");
const { importCSV } = require("../database/importCSV");
const path = require("path");
const { getTestServer, closeServer } = require("./utils/testServer");

let server;

describe("CSV Import Test", () => {
  beforeAll(async () => {
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
      console.error("❌ Error closing resources:", error);
    }
  });

  beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Database cleaned before test.");
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