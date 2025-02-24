const fs = require("fs");
const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer, closeTestServer } = require("./utils/testServer");

let server, app;
const TEST_WALLET = "dym98765";
const WHITELIST_FILE = "database/whitelist.csv";

describe("API /wallet/check", () => {

  beforeAll(async () => {
    console.log("🔄 Adding test wallet to whitelist...");
    
    // Assicura che il file esista e scrive il test wallet
    if (!fs.existsSync(WHITELIST_FILE)) {
      fs.writeFileSync(WHITELIST_FILE, `${TEST_WALLET}\n`);
    } else {
      fs.appendFileSync(WHITELIST_FILE, `${TEST_WALLET}\n`);
    }

    // 🔄 Attendi che il file system processi la scrittura
    await new Promise(resolve => setTimeout(resolve, 500));

    // Avvia il server di test
    ({ server, app } = await startTestServer());
  });

  afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    if (server) server.close();

    // Rimuovi il wallet dal file CSV dopo il test
    let data = fs.readFileSync(WHITELIST_FILE, "utf8").split("\n");
    data = data.filter(line => line.trim() !== TEST_WALLET);
    fs.writeFileSync(WHITELIST_FILE, data.join("\n"));
  });

  beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Wallet collection cleared.");
  });

  test("Should return 'not eligible' for unknown wallet", async () => {
    const res = await request(app).get("/api/wallet/check/dym123456");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("not eligible");
  });

  test("Should insert and verify an eligible wallet", async () => {
    await Wallet.findOneAndUpdate(
      { address: TEST_WALLET },
      { $set: { status: "eligible", checkedAt: new Date() } },
      { upsert: true, new: true }
    );

    const res = await request(app).get(`/api/wallet/check/${TEST_WALLET}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("eligible");
  });

});