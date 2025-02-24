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
    testServer.server.close(() => {
      console.log("✅ Test Server closed.");
    });
  }
  await mongoose.connection.close();
  console.log("✅ MongoDB Connection Closed.");
});