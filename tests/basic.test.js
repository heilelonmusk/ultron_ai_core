const mongoose = require("mongoose");
const { getTestServer, closeServer } = require("./utils/testServer");

describe("Basic System Check", () => {
  let testServer;

  beforeAll(async () => {
    jest.setTimeout(30000); // ⏳ Aumenta il timeout per connessioni lente
    testServer = await getTestServer();
  });

  afterAll(async () => {
    try {
      if (testServer) {
        await closeServer();
        console.log("✅ Test Server closed.");
      }
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("✅ MongoDB Connection Closed.");
      }
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  });

  test("Server and DB should start correctly", async () => {
    expect(mongoose.connection.readyState).toBe(1);
    expect(testServer).toBeDefined();
    expect(testServer.app).toBeDefined();
    expect(testServer.server).toBeDefined();
    expect(testServer.port).toBeDefined();
  });
});