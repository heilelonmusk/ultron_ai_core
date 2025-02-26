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
            const documents = await collection.find({}).toArray();
            if (documents.length > 0) {
                backupData[collectionName] = documents;
            }
        }
    });

    afterAll(async () => {
        console.log("🔄 Restoring original database state...");
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            const collectionName = collection.collectionName;

            // Cancella solo le collezioni che sono state effettivamente alterate durante i test
            if (backupData[collectionName]) {
                await collection.deleteMany({});
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

        if (!fs.existsSync(invalidCSV)) {
            fs.writeFileSync(invalidCSV, "invalid_wallet\nwrong_wallet_format"); // Crea un file di test temporaneo
        }

        await importCSV(invalidCSV, "eligible");

        const wallets = await Wallet.find({ status: "eligible" });
        expect(wallets.length).toBe(0);

        fs.unlinkSync(invalidCSV); // Pulisce il file di test dopo l'esecuzione
    });
});