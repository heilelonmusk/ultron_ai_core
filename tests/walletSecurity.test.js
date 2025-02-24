const mongoose = require("mongoose");
const request = require("supertest");
const Wallet = require("../api/models/WalletModel");
const { startTestServer, closeTestServer } = require("./utils/testServer");

let server, app;

beforeAll(async () => {
    console.log("🔄 Starting test server...");
    ({ server, app } = await startTestServer());
    console.log("🚀 Test Server Started");

    let retries = 0;
    while (mongoose.connection.readyState !== 1) {
        if (retries > 30) throw new Error("❌ MongoDB connection timeout");
        console.log(`⏳ Waiting for MongoDB connection... Attempt ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
    }

    console.log("✅ MongoDB connection established.");
}, 50000);

afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    await closeTestServer();
}, 30000);

beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) {
        throw new Error("❌ MongoDB connection lost before test cleanup.");
    }

    console.log("🧹 Resetting Wallet collection...");
    await Wallet.updateMany({}, { $set: { status: "not eligible" } });
    await new Promise(resolve => setTimeout(resolve, 100));
}, 50000);

describe("🔐 Wallet Security Tests", () => {
    
    test("Should reject SQL Injection attempt", async () => {
        console.log("🔍 Testing SQL Injection...");
        const res = await request(app).get(`/api/wallet/check/' OR '1'='1`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid address format");
    }, 30000);

    test("Should reject XSS attack attempt", async () => {
        console.log("🔍 Testing XSS Injection...");
        const res = await request(app).get(`/api/wallet/check/%3Cscript%3Ealert('XSS')%3C/script%3E`);
        expect([400, 404]).toContain(res.status);
    }, 30000);

    test("Should reject overly long wallet address", async () => {
        console.log("🔍 Testing overly long wallet address...");
        const longWallet = "dym" + "1".repeat(300);
        const res = await request(app).get(`/api/wallet/check/${longWallet}`);
        expect(res.status).toBe(400);
    }, 30000);

    test("Should reject special characters in wallet address", async () => {
        console.log("🔍 Testing special characters in wallet address...");
        const invalidWallet = "dym!@#$%^&*()";
        const res = await request(app).get(`/api/wallet/check/${invalidWallet}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid address format");
    }, 30000);

    test("Should prevent unauthorized access to protected routes", async () => {
        console.log("🔍 Testing unauthorized access...");
        const res = await request(app)
            .post("/api/wallet/protected-route")
            .set("Authorization", "invalid_token");
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    }, 30000);
});