const request = require("supertest");
const { startTestServer, closeTestServer } = require("./utils/testServer");

let app, server;

describe("🔍 Server Test Suite", () => {
  beforeAll(async () => {
    console.log("🚀 Avvio test server...");
    ({ app, server } = await startTestServer());
  });

  afterAll(async () => {
    console.log("🛑 Chiusura test server...");
    await closeTestServer();
  });

  test("✅ Server should respond to health check", async () => {
    console.log("🔍 Testing /health endpoint...");
    
    const res = await request(app).get("/health");
    console.log("📌 Risposta ricevuta:", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});