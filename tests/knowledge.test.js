const request = require("supertest");
const { startTestServer, closeTestServer } = require("./utils/testServer");
const mongoose = require("mongoose");

let app, server;

// ✅ Assicuriamoci che il modello venga usato correttamente
const Knowledge = mongoose.models.Knowledge || mongoose.model("Knowledge", new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true }
}));

describe("API /knowledge", () => {
  beforeAll(async () => {
    console.log("🔄 Starting test server...");
    ({ server, app } = await startTestServer());
    console.log("✅ Test server started!");

    // 🛠 Popoliamo il database con un dato di test
    console.log("🛠 Populating test database...");
    await Knowledge.create({
      query: "DYM",
      response: "Dymension is a modular blockchain optimized for rollups."
    });

    // 🔄 Attendi 1 secondo per permettere a MongoDB di indicizzare i dati
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    console.log("🗑 Cleaning up test database...");
    await Knowledge.deleteMany({});
    console.log("🛑 Closing test server...");
    await closeTestServer();
  });

  test("✅ Should return knowledge data", async () => {
    console.log("🔍 Verificando che il dato esista nel DB...");
    const knowledgeData = await Knowledge.find({});
    console.log("📌 Contenuto database:", knowledgeData);

    const response = await request(app).get("/api/knowledge/query?q=DYM");
    console.log("📌 Response:", response.status, response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("response", "Dymension is a modular blockchain optimized for rollups.");
  });

  test("❌ Should handle invalid endpoint", async () => {
    const response = await request(app).get("/api/knowledge/invalid-endpoint");
    console.log("📌 Response:", response.status, response.body);
    expect(response.status).toBe(404);
  });
});