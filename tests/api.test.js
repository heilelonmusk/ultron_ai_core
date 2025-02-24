const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { getTestServer } = require("./utils/testServer");

let server, app;

describe("API /wallet/check", () => {
  beforeAll(async () => {
    ({ server, app } = await getTestServer());
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("✅ Test Server closed.");
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 🔹 Pulisce la collezione Wallet prima di ogni test
    await Wallet.deleteMany({});
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const uniqueAddress = `dym${Math.floor(Math.random() * 100000)}`; // 🔹 Evita duplicati

    const res = await request(app).get(`/api/wallet/check/${uniqueAddress}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should update existing eligible wallet", async () => {
    const walletData = { address: "dym123456789", status: "eligible" };

    // 🔹 Usa upsert per evitare duplicati
    await Wallet.updateOne(
      { address: walletData.address },
      { $set: walletData },
      { upsert: true }
    );

    const res = await request(app).get(`/api/wallet/check/${walletData.address}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  });
});