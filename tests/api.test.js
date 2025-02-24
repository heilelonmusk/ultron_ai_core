const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { getTestServer, closeServer } = require("./utils/testServer");

let server, app;

describe("API /wallet/check", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    ({ server, app } = await getTestServer());
  });

  afterAll(async () => {
    try {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log("✅ Test Server closed.");
      }
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("✅ MongoDB Connection Closed.");
      }
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  });

  beforeEach(async () => {
    try {
      await Wallet.deleteMany({});
      console.log("🗑️ Wallet collection cleared.");
    } catch (error) {
      console.error("❌ Error clearing Wallet collection:", error);
    }
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const uniqueAddress = `dym${Math.floor(Math.random() * 100000)}`;

    const res = await request(app).get(`/api/wallet/check/${uniqueAddress}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should update existing eligible wallet", async () => {
    const walletData = { address: "dym123456789", status: "eligible" };

    await Wallet.updateOne(
      { address: walletData.address },
      { $set: walletData },
      { upsert: true }
    );

    const res = await request(app).get(`/api/wallet/check/${walletData.address}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  });

  test("Should insert new wallet as 'not eligible'", async () => {
    const newWallet = { address: "dym987654321", status: "not eligible" };

    await Wallet.create(newWallet);

    const res = await request(app).get(`/api/wallet/check/${newWallet.address}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });
});