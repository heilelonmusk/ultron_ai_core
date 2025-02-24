const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const { closeTestServer } = require("./testServer");

const mongoURI = process.env.MONGO_URI;

beforeAll(async () => {
  console.log("🔄 Connecting to test database...");
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  console.log("🗑️ Clearing test database...");
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  console.log("🛑 Closing test database connection...");
  await mongoose.connection.close();
  await closeTestServer();
});