const mongoose = require("mongoose");
const { getTestServer, closeServer } = require("./utils/testServer");

let testServer = null;

beforeAll(async () => {
  jest.setTimeout(30000); // ⏳ Estende il timeout per evitare timeout prematuri
  try {
    testServer = await getTestServer();
    global.testApp = testServer.app;
    global.testServer = testServer.server;
    global.testPort = testServer.port;
    console.log("🚀 Test Server started on port", global.testPort);
  } catch (error) {
    console.error("❌ Error starting Test Server:", error.message);
    throw error; // Se fallisce il setup, Jest deve segnalare il problema
  }
});

afterAll(async () => {
  try {
    if (testServer) {
      await closeServer(); // 🔹 Chiude il server correttamente
      console.log("✅ Test Server closed.");
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(); // 🔹 Chiude la connessione a MongoDB in modo sicuro
      console.log("✅ MongoDB Connection Closed.");
    }
  } catch (error) {
    console.error("❌ Error closing resources:", error.message);
  }
});