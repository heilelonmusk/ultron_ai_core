const mongoose = require("mongoose");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");
require("dotenv").config();

describe("MongoDB Connection", () => {
  beforeAll(async () => {
    console.log("🔄 Connecting to test database...");
    await connectMongoDB();
  });

  afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await disconnectMongoDB();
  });

  test("✅ Should connect to MongoDB successfully", async () => {
    console.log("✅ Verifying MongoDB connection...");
    expect(mongoose.connection.readyState).toBe(1); // 1 = Connected
  });

  test("❌ Should fail to connect with invalid URI", async () => {
    await disconnectMongoDB(); // Assicura che la connessione venga chiusa prima di testare

    try {
      await mongoose.connect("mongodb://invalid-url:27017/testdb", {
        serverSelectionTimeoutMS: 5000, // Timeout per evitare test bloccati
      });
    } catch (error) {
      expect(error).toBeDefined();
      console.log("✅ Caught expected connection error:", error.message);
    } finally {
      // Riattiva la connessione per evitare impatti sui test successivi
      await connectMongoDB();
    }
  });

  test("🛑 Should disconnect from MongoDB successfully", async () => {
    console.log("🛑 Cleaning test database before disconnection...");
    
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }

    console.log("🛑 Disconnecting MongoDB test connection...");
    await disconnectMongoDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 = Disconnected

    // **Riavvia la connessione per i test successivi**
    await connectMongoDB();
  });
});