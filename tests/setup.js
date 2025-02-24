const connectDB = require("../config/connectMongoDB");
const mongoose = require("mongoose");
const { app } = require("../server");

beforeAll(async () => {
  await connectDB();
  global.testServer = app.listen(6001, () => console.log("🚀 Test Server running on port 6001"));
});

afterAll(async () => {
  await mongoose.connection.close();
  global.testServer.close();
});