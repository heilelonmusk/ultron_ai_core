// 🛠️ walletModel.test.js - Test per il modello Wallet
const Wallet = require("../api/models/walletModel");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");

describe("🔍 Wallet Model", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  afterAll(async () => {
    await disconnectMongoDB();
  });

  test("✅ Should create a new wallet entry", async () => {
    const wallet = new Wallet({ address: "dym987654", status: "not eligible" });
    const savedWallet = await wallet.save();
    expect(savedWallet.address).toBe("dym987654");
  });

  test("❌ Should not allow duplicate wallets", async () => {
    try {
      await new Wallet({ address: "dym987654", status: "eligible" }).save();
    } catch (error) {
      expect(error.code).toBe(11000); // Duplicate key error
    }
  });

  test("❌ Should enforce valid date format", async () => {
    try {
      await new Wallet({ address: "dym999999", status: "eligible", importedAt: "Invalid Date" }).save();
    } catch (error) {
      expect(error.message).toMatch(/Cast to date failed/);
    }
  });
});