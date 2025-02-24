// tests/api.test.js
const request = require("supertest");
const app = require("../server");
const Wallet = require("../api/models/WalletModel");

describe("API /wallet/check", () => {
  beforeEach(async () => {
    await Wallet.deleteMany();
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const res = await request(app).get("/api/wallet/check/dym123456789");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should update existing eligible wallet", async () => {
    await Wallet.create({ address: "dym123456789", status: "eligible" });
    const res = await request(app).get("/api/wallet/check/dym123456789");
    expect(res.body.status).toBe("eligible");
  });
});