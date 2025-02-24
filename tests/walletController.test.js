const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer, closeTestServer } = require("../tests/utils/testServer");

let server, app;
const TEST_WALLET_ELIGIBLE = "dym98765";
const TEST_WALLET_NOT_ELIGIBLE = "dym123456";
const INVALID_WALLET = "INVALID_WALLET!";

describe("🛠️ API /wallet Controller", () => {
    
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

    // ✅ Test 1: Wallet non presente in whitelist
    test("Should return 'not eligible' for unknown wallet", async () => {
        const res = await request(app).get(`/api/wallet/check/${TEST_WALLET_NOT_ELIGIBLE}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("not eligible");
    });

    // ✅ Test 2: Wallet valido ed eligibile
    test("Should insert and verify an eligible wallet", async () => {
        await Wallet.findOneAndUpdate(
            { address: TEST_WALLET_ELIGIBLE },
            { $set: { status: "eligible", checkedAt: new Date() } },
            { upsert: true, new: true }
        );

        const res = await request(app).get(`/api/wallet/check/${TEST_WALLET_ELIGIBLE}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("eligible");
    });

    // ✅ Test 3: Wallet con formato non valido
    test("Should return 400 for invalid wallet format", async () => {
        const res = await request(app).get(`/api/wallet/check/${INVALID_WALLET}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid address format");
    });

    // ✅ Test 4: Inserimento e verifica nel database
    test("Should correctly store wallet status in database", async () => {
        await request(app).get(`/api/wallet/check/${TEST_WALLET_ELIGIBLE}`);

        const wallet = await Wallet.findOne({ address: TEST_WALLET_ELIGIBLE });
        expect(wallet).not.toBeNull();
        expect(wallet.status).toBe("eligible");
    });

    // ✅ Test 5: Simulazione di errore nel DB
    test("Should handle database errors gracefully", async () => {
        jest.spyOn(Wallet, "findOneAndUpdate").mockImplementation(() => {
            throw new Error("Database error");
        });

        const res = await request(app).get(`/api/wallet/check/${TEST_WALLET_ELIGIBLE}`);
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Server error");

        Wallet.findOneAndUpdate.mockRestore();
    });

});