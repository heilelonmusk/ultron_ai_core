const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");

let server;

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    jest.setTimeout(30000); // ⏳ Estende il timeout per evitare timeout su connessioni lente
    const testServer = await getTestServer();
    server = testServer.server;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("✅ Test Server closed.");
    }
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed.");
  });

  test("Database should connect successfully", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 🔄 Attende un attimo per la connessione
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("Should insert and retrieve a test document", async () => {
    const TestModel = mongoose.model("Test", new mongoose.Schema({ name: String }));
    
    await TestModel.create({ name: "Test Document" });

    const foundDoc = await TestModel.findOne({ name: "Test Document" });
    expect(foundDoc).not.toBeNull();
    expect(foundDoc.name).toBe("Test Document");
  });
});