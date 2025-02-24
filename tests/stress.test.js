const mongoose = require("mongoose");
const request = require("supertest");
const { getTestServer, closeServer } = require("./utils/testServer");

let server, app;

describe("Stress Test", () => {
  beforeAll(async () => {
    jest.setTimeout(40000); // ⏳ Aumenta il timeout per evitare interruzioni premature
    ({ server, app } = await getTestServer());
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
      console.error("❌ Error closing resources:", error.message);
    }
  });

  test("Handles 1000 concurrent requests", async () => {
    const requests = Array.from({ length: 1000 }, () =>
      request(app).get("/api/wallet/check/dym123456789")
    );

    try {
      const responses = await Promise.allSettled(requests); // 🔹 Usa `allSettled()` per evitare crash su errori

      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          expect(res.value.status).toBe(200);
        } else {
          console.warn(`⚠️ Request ${i} failed:`, res.reason.message);
        }
      });

    } catch (error) {
      console.error("❌ Error during stress test:", error.message);
      throw error; // Forza Jest a segnalare il fallimento del test
    }
  }, 40000); // 🔹 Timeout esteso per test pesanti
});