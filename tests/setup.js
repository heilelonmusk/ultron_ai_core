const mongoose = require("mongoose");
const connectDB = require("../config/connectMongoDB");
const app = require("../server");

beforeAll(async () => {
  await connectDB();
  global.testServer = app.listen(6001, () => console.log("🚀 Test Server running on port 6001"));
});

afterAll(async () => {
  if (global.testServer) {
    await new Promise((resolve) => global.testServer.close(resolve)); // 🛠 Attendi che il server si chiuda completamente
    console.log("✅ Test Server closed.");
  }
  await mongoose.connection.close();
});