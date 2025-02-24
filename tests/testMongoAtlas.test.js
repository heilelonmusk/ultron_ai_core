const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");

let server;

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
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
    expect(mongoose.connection.readyState).toBe(1);
  });
});