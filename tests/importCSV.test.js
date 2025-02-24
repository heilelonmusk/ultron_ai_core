require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { importCSV } = require("../database/importCSV");
const Wallet = require("../api/models/WalletModel");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");

const TEST_DB_URI = "mongodb://127.0.0.1:27017/test_import";

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await connectMongoDB();
    console.log("✅ Connected to test database");
});

beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Cleared Wallet collection");
});

afterAll(async () => {
    await disconnectMongoDB();
    console.log("🛑 Closing test database connection...");
});

describe("CSV Import Functionality", () => {
    test("Should correctly import eligible wallets from CSV", async () => {
        const whitelistPath = path.join(__dirname, "../database/whitelist.csv");
        expect(fs.existsSync(whitelistPath)).toBe(true);

        await importCSV(whitelistPath, "eligible");

        const wallets = await Wallet.find({ status: "eligible" });
        expect(wallets.length).toBeGreaterThan(0);
        wallets.forEach(wallet => {
            expect(wallet.address).toMatch(/^dym[0-9a-z]+$/);
            expect(wallet.status).toBe("eligible");
        });
    });

    test("Should correctly import non-eligible wallets from CSV", async () => {
        const nonEligiblePath = path.join(__dirname, "../database/non_eligible.csv");
        expect(fs.existsSync(nonEligiblePath)).toBe(true);

        await importCSV(nonEligiblePath, "not eligible");

        const wallets = await Wallet.find({ status: "not eligible" });
        expect(wallets.length).toBeGreaterThan(0);
        wallets.forEach(wallet => {
            expect(wallet.address).toMatch(/^dym[0-9a-z]+$/);
            expect(wallet.status).toBe("not eligible");
        });
    });

    test("Should ignore invalid wallet addresses", async () => {
        const invalidCSV = path.join(__dirname, "../database/invalid_wallets.csv");
        fs.writeFileSync(invalidCSV, "invalid_address1\ninvalid_address2\n", "utf8");

        await importCSV(invalidCSV, "eligible");
        const wallets = await Wallet.find({});
        expect(wallets.length).toBe(0);

        fs.unlinkSync(invalidCSV);
    });
});