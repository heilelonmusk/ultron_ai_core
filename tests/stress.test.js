const Wallet = require("../api/models/WalletModel");
const request = require("supertest");
const app = require("../server");

describe("Stress Test", () => {
  test("Should handle 1000 concurrent API requests", async () => {
    const requests = [];
    for (let i = 0; i < 1000; i++) {
      requests.push(request(app).get(`/api/wallet/check/dym${i}`));
    }

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
    });
  });
});