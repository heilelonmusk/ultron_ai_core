const mongoose = require("mongoose");
const connectDB = require("../config/connectMongoDB");
const app = require("../server");

beforeAll(async () => {
  await connectDB();
  global.testServer = app.listen(6001, () => console.log("🚀 Test Server running on port 6001"));
});

afterAll(async () => {
  if (global.testServer) {
    global.testServer.close();
    console.log("✅ Test Server closed.");
  }
  await mongoose.connection.close();
});