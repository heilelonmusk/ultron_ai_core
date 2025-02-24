const mongoose = require("mongoose");
const request = require("supertest");
const { getTestServer } = require("./testServer");

let server, app;

describe("Stress Test", () => {
  beforeAll(async () => {
    ({ server, app } = await getTestServer());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
    console.log("✅ Test Server closed.");
  });

  test("Handles 1000 concurrent requests", async () => {
    const requests = [];
    for (let i = 0; i < 1000; i++) {
      requests.push(request(app).get("/api/wallet/check/dym123456789"));
    }

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });
  }, 30000); // Estensione timeout per stress test
});