require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/connectMongoDB");

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Database should connect successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});