const mongoose = require("mongoose");
const { getTestServer } = require("./utils/testServer");
const getPort = require("get-port"); // 📌 Usa require() invece di import()

let testServer = null;

beforeAll(async () => {
  const port = await getPort(); // 📌 Ottieni una porta libera
  testServer = await getTestServer(port);
  
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