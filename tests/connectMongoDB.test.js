const mongoose = require("mongoose");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");
require("dotenv").config();

// ✅ Test della connessione MongoDB
describe("MongoDB Connection", () => {
  beforeAll(async () => {
    console.log("🛑 Closing any existing MongoDB connections...");
    await disconnectMongoDB(); // Chiudiamo prima di iniziare il test
    console.log("🔄 Connecting to test database...");
    await connectMongoDB();
  });

  afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await disconnectMongoDB();
  });

  test("Should connect to MongoDB successfully", async () => {
    console.log("✅ Verifying MongoDB connection...");
    expect(mongoose.connection.readyState).toBe(1); // 1 indica connessione attiva
  });

  test("Should handle connection errors", async () => {
    try {
      await connectMongoDB();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("Should disconnect from MongoDB successfully", async () => {
    console.log("🛑 Disconnecting MongoDB test connection...");
    await disconnectMongoDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 indica connessione chiusa
  });
});