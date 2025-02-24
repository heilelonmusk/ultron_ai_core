const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer, closeTestServer } = require("./utils/testServer");

let server, app;
const TEST_WALLET_ELIGIBLE = "dym98765";
const TEST_WALLET_NOT_ELIGIBLE = "dym123456";

// ✅ Setup del test
beforeAll(async () => {
    ({ server, app } = await startTestServer());
    console.log("🚀 Test Server Started");
});

afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    if (server) server.close();
});

beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Wallet collection cleared.");
});

// ✅ Test API /wallet/check

describe("API /wallet/check", () => {
    
    test("Should return 'not eligible' for unknown wallet", async () => {
        const res = await request(app).get(`/api/wallet/check/dym123456`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("not eligible");
    });
    
    test("Should insert and verify an eligible wallet", async () => {
        await Wallet.findOneAndUpdate(
            { address: "dym98765" },
            { $set: { status: "eligible", checkedAt: new Date() } },
            { upsert: true, new: true }
        );

        const res = await request(app).get(`/api/wallet/check/dym98765`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("eligible");
    });
    
    test("Should return 400 for invalid wallet format", async () => {
        const res = await request(app).get("/api/wallet/check/INVALID_WALLET!");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid address format");
    });

});