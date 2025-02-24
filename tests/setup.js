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
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("✅ MongoDB Connection Closed.");
    }
    
    if (testServer) {
      await new Promise((resolve) => testServer.server.close(resolve));
      console.log("✅ Test Server closed.");
    }
  } catch (error) {
    console.error("❌ Error during teardown:", error);
  }
});