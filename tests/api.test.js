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
    await mongoose.connection.close();
    if (server) server.close();
    console.log("✅ Test Server closed.");
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const res = await request(app).get("/api/wallet/check/dym123456789");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should update existing eligible wallet", async () => {
    await Wallet.create({ address: "dym123456789", status: "eligible" });

    const res = await request(app).get("/api/wallet/check/dym123456789");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  });
});