const fs = require("fs");
const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer } = require("./utils/testServer");

let server, app;
const TEST_WALLET = "dym98765";
const WHITELIST_FILE = "database/whitelist.csv";

jest.setTimeout(30000); // Imposta timeout globale a 30 secondi

beforeAll(async () => {
  if (mongoose.connection.readyState !== 1) {
      console.log("🔄 Establishing fresh MongoDB connection...");
      await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 30000, 
          socketTimeoutMS: 45000,
      });
  }
}, 30000);

describe("API /wallet/check", () => {
  
  beforeAll(async () => {
    console.log("🔄 Adding test wallet to whitelist...");
  
    if (!fs.existsSync(WHITELIST_FILE)) {
      fs.writeFileSync(WHITELIST_FILE, `${TEST_WALLET}\n`);
    } else {
      fs.appendFileSync(WHITELIST_FILE, `\n${TEST_WALLET}`);
    }

    ({ server, app } = await startTestServer());
  }, 30000);

  afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    if (server) server.close();

    let data = fs.readFileSync(WHITELIST_FILE, "utf8").trim().split("\n");
    data = data.filter(line => line.trim() !== TEST_WALLET);
    fs.writeFileSync(WHITELIST_FILE, data.join("\n") + "\n");
  }, 30000);

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) {
        console.log("🔄 Waiting for MongoDB connection...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendi 2 secondi prima di riprovare
    }

    if (mongoose.connection.readyState === 1) {
        await Wallet.deleteMany({});
        console.log("🗑️ Wallet collection cleared.");
    } else {
        throw new Error("❌ MongoDB connection not established before test execution.");
    }
}, 30000); // Timeout per il beforeEach()

  test("Should return 'not eligible' for unknown wallet", async () => {
    const res = await request(app).get("/api/wallet/check/dym123456");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  }, 30000);

  test("Should insert and verify an eligible wallet", async () => {
    await Wallet.findOneAndUpdate(
      { address: TEST_WALLET },
      { $set: { status: "eligible", checkedAt: new Date() } },
      { upsert: true, new: true }
    );

    const res = await request(app).get(`/api/wallet/check/${TEST_WALLET}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  }, 30000);

});