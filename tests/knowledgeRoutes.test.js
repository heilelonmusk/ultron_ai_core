const request = require("supertest");
const { startTestServer, closeTestServer } = require("./utils/testServer"); // ✅ Percorso corretto
const mongoose = require("mongoose");

// ✅ Importa il modello Knowledge
const Knowledge = mongoose.models.Knowledge || mongoose.model("Knowledge", new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true }
}));

let app, server;

describe("🔍 Knowledge Routes API", () => {
  beforeAll(async () => {
    console.log("🔄 Starting test server...");
    ({ server, app } = await startTestServer());
    console.log("✅ Test server started!");

    // 🛠 Inseriamo un dato di test nel database
    console.log("🛠 Populating test database...");
    await Knowledge.create({
      query: "DYM",
      response: "Dymension is a modular blockchain optimized for rollups."
    });

    // 🔄 Attendi 1 secondo per permettere a MongoDB di salvare il dato
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    console.log("🗑 Cleaning up test database...");
    await Knowledge.deleteMany({});
    console.log("🛑 Closing test server...");
    await closeTestServer();
  });

  test("✅ Should return data for valid query", async () => {
    console.log("🔍 Verificando che il dato esista nel DB...");
    const knowledgeData = await Knowledge.find({});
    console.log("📌 Contenuto database:", knowledgeData);

    const response = await request(app).get("/api/knowledge/query?q=DYM");
    console.log("📌 Response:", response.status, response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("response", "Dymension is a modular blockchain optimized for rollups.");
  });

  test("❌ Should return error for missing query param", async () => {
    const response = await request(app).get("/api/knowledge/query");
    console.log("📌 Response:", response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Missing query parameter");
  });
});