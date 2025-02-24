const fs = require("fs");
const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer, closeTestServer } = require("./utils/testServer");

let server, app;

describe("API /wallet/check", () => {
  
  beforeAll(async () => {
    console.log("🔄 Adding test wallet to whitelist...");
    fs.appendFileSync("database/whitelist.csv", "dym98765\n");
  });
  
  beforeAll(async () => {
    ({ server, app } = await startTestServer());
  });

  afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    if (server) server.close();
  });


  beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Wallet collection cleared.");
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const res = await request(app).get("/api/wallet/check/dym123456");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should insert and verify an eligible wallet", async () => {
    await Wallet.create({ address: "dym98765", status: "eligible" });

    const res = await request(app).get("/api/wallet/check/dym98765");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  });
});