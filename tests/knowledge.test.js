const request = require("supertest");
const mongoose = require("mongoose");
const { startTestServer, closeTestServer } = require("./utils/testServer");
let server, app;

describe("API /knowledge", () => {
  beforeAll(async () => {
    console.log("🔄 Starting test server...");
    ({ server, app } = await startTestServer());
    console.log("✅ Test server started!");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
  });

  test("Should return knowledge data", async () => {
    const res = await request(app).get("/api/knowledge/get").query({ q: "DYM" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("response");
    expect(typeof res.body.response).toBe("string");
  });

  test("Should handle invalid endpoint", async () => {
    const res = await request(app).get("/api/knowledge/invalid");
    expect(res.status).toBe(404);
  });
});
