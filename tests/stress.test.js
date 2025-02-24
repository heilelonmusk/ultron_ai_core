const request = require("supertest");
const { app } = require("../server");

describe("Stress Test", () => {
  test("Handles 1000 concurrent requests", async () => {
    const requests = [];

    for (let i = 0; i < 1000; i++) {
      requests.push(request(app).get("/api/wallet/check/dym123456789"));
    }

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Aspetta prima di chiudere
  });
});