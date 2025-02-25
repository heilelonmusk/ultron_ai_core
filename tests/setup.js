const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
  console.log("🔄 Connecting to test database...");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/testdb");
  }
});

afterEach(async () => {
  console.log("🗑 Clearing test database...");

  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  console.log("🛑 Closing test database connection...");
  await mongoose.disconnect();
});