const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");

describe("Basic System Check", () => {
  let testServer;

  beforeAll(async () => {
    testServer = await getTestServer();
  });

  afterAll(async () => {
    if (testServer) {
      testServer.server.close();
    }
    await mongoose.connection.close();
  });

  test("Server and DB should start correctly", async () => {
    expect(mongoose.connection.readyState).toBe(1);
    expect(testServer.app).toBeDefined();
    expect(testServer.server).toBeDefined();
    expect(testServer.port).toBeDefined();
  });
});