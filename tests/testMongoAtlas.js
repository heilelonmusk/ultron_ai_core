// tests/testMongoAtlas.js
require("dotenv").config();
const mongoose = require("mongoose");

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "heilelonDB" });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Database should connect successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});