const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");

let testServer = null;

beforeAll(async () => {
  testServer = await getTestServer();
  global.testApp = testServer.app;
  global.testServer = testServer.server;
  global.testPort = testServer.port;
});

afterAll(async () => {
  if (testServer) {
    await new Promise((resolve) => testServer.server.close(resolve));
    console.log("✅ Test Server closed.");
  }
  await mongoose.disconnect();
  console.log("✅ MongoDB Connection Closed.");
});