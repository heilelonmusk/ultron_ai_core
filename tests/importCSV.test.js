const mongoose = require("mongoose");
const fs = require("fs");
const { importCSV } = require("../database/importCSV");
const Wallet = require("../api/models/WalletModel");

let backupData = {};

describe("CSV Import Functionality", () => {
    beforeAll(async () => {
        console.log("🔄 Connecting to test database...");
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/testdb", {});
        }

        console.log("📥 Backing up database...");
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            const collectionName = collection.collectionName;
            backupData[collectionName] = await collection.find({}).toArray();
        }
    });

    afterAll(async () => {
        console.log("🔄 Restoring original database state...");

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            const collectionName = collection.collectionName;
            await collection.deleteMany({});
            if (backupData[collectionName]) {
                await collection.insertMany(backupData[collectionName]);
            }
        }

        await mongoose.disconnect();
    });

    test("Should correctly import eligible wallets from CSV", async () => {
        const csvFile = "./database/whitelist.csv";
        await importCSV(csvFile, "eligible");

        const wallets = await Wallet.find({ status: "eligible" });
        expect(wallets.length).toBeGreaterThan(0);
    });

    test("Should correctly import non-eligible wallets from CSV", async () => {
        const csvFile = "./database/non_eligible.csv";
        await importCSV(csvFile, "not eligible");

        const wallets = await Wallet.find({ status: "not eligible" });
        expect(wallets.length).toBeGreaterThan(0);
    });

    test("Should ignore invalid wallet addresses", async () => {
        const invalidCSV = "./database/invalid_wallets.csv";
        await importCSV(invalidCSV, "eligible");

        const wallets = await Wallet.find({ status: "eligible" });
        expect(wallets.length).toBe(0);

        fs.unlinkSync(invalidCSV); // Pulisce il file di test
    });
});