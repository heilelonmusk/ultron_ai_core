const mongoose = require("mongoose");
const { getTestServer, closeServer } = require("./utils/testServer");

let server;

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    const testServer = await getTestServer();
    server = testServer.server;

    await mongoose.connection.asPromise();
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("✅ Test Server closed.");
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("✅ MongoDB Connection Closed.");
    }
  });

  beforeEach(async () => {
    await mongoose.connection.db.collection("tests").deleteMany({});
  });

  test("Database should connect successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("Should insert and retrieve a test document", async () => {
    let TestModel;
    if (mongoose.modelNames().includes("Test")) {
      TestModel = mongoose.model("Test");
    } else {
      TestModel = mongoose.model("Test", new mongoose.Schema({ name: String }));
    }

    await TestModel.create({ name: "Test Document" });

    const foundDoc = await TestModel.findOne({ name: "Test Document" });
    expect(foundDoc).not.toBeNull();
    expect(foundDoc.name).toBe("Test Document");
  });
});