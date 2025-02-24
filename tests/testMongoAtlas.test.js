const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");

let server;

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    ({ server } = await getTestServer());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
    console.log("✅ Test Server closed.");
  });

  test("Database should connect successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});