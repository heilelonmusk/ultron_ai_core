const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer } = require("./utils/testServer");

let server, app;
const TEST_WALLET_ELIGIBLE = "dym98765";
const TEST_WALLET_NOT_ELIGIBLE = "dym123456";
const INVALID_WALLET = "INVALID_WALLET!";

describe("🛠️ API /wallet Routes", () => {
    
    beforeAll(async () => {
        ({ server, app } = await startTestServer());
        console.log("🚀 Test Server Started");

        // Assicura che MongoDB sia connesso prima di iniziare i test
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI, {
            });
        }
    }, 30000);

    afterAll(async () => {
        console.log("🛑 Closing test database connection...");
        await mongoose.connection.close();
        if (server) server.close();
    }, 30000);

    beforeEach(async () => {
        try {
            await Wallet.deleteMany({});
           console.log("🗑️ Wallet collection cleared.");
        } catch (error) {
            console.error("❌ Error clearing Wallet collection:", error);
        }
    });

    test("Should return 'not eligible' for unknown wallet", async () => {
        const res = await request(app).get(`/api/wallet/check/${TEST_WALLET_NOT_ELIGIBLE}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("not eligible");
    }, 30000);
    
    test("Should insert and verify an eligible wallet", async () => {
        await Wallet.findOneAndUpdate(
            { address: TEST_WALLET_ELIGIBLE },
            { $set: { status: "eligible", checkedAt: new Date() } },
            { upsert: true, new: true }
        );

        const res = await request(app).get(`/api/wallet/check/${TEST_WALLET_ELIGIBLE}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("eligible");
    }, 30000);
    
    test("Should return 400 for invalid wallet format", async () => {
        const res = await request(app).get(`/api/wallet/check/${INVALID_WALLET}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid address format");
    }, 30000);

});