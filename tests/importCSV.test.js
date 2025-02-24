require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { importCSV } = require("../database/importCSV");
const Wallet = require("../api/models/WalletModel"); 

const TEST_DB_URI = "mongodb://127.0.0.1:27017/test_import";

// ✅ Setup della connessione a MongoDB prima dei test
beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("✅ Connected to test database");
});

// ✅ Pulizia del database prima di ogni test
beforeEach(async () => {
    await Wallet.deleteMany({});
    console.log("🗑️ Cleared Wallet collection");
});

// ✅ Chiusura della connessione dopo i test
afterAll(async () => {
    await mongoose.connection.close();
    console.log("🛑 Closing test database connection...");
});

// ✅ Test per verificare l'importazione da whitelist.csv
it("Should correctly import eligible wallets from CSV", async () => {
    const whitelistPath = path.join(__dirname, "../database/whitelist.csv");
    expect(fs.existsSync(whitelistPath)).toBe(true);

    await importCSV("whitelist.csv", "eligible");

    const wallets = await Wallet.find({ status: "eligible" });
    expect(wallets.length).toBeGreaterThan(0);
    wallets.forEach(wallet => {
        expect(wallet.address).toMatch(/^dym[0-9a-z]+$/); // Deve essere un indirizzo Dymension valido
        expect(wallet.status).toBe("eligible");
    });
});

// ✅ Test per verificare l'importazione da non_eligible.csv
it("Should correctly import non-eligible wallets from CSV", async () => {
    const nonEligiblePath = path.join(__dirname, "../database/non_eligible.csv");
    expect(fs.existsSync(nonEligiblePath)).toBe(true);

    await importCSV("non_eligible.csv", "not eligible");

    const wallets = await Wallet.find({ status: "not eligible" });
    expect(wallets.length).toBeGreaterThan(0);
    wallets.forEach(wallet => {
        expect(wallet.address).toMatch(/^dym[0-9a-z]+$/);
        expect(wallet.status).toBe("not eligible");
    });
});

// ✅ Test per verificare il comportamento con un CSV contenente indirizzi non validi
it("Should ignore invalid wallet addresses", async () => {
    const invalidCSV = path.join(__dirname, "../database/invalid_wallets.csv");
    fs.writeFileSync(invalidCSV, "invalid_address1\ninvalid_address2\n", "utf8");

    await importCSV("invalid_wallets.csv", "eligible");
    const wallets = await Wallet.find({});
    expect(wallets.length).toBe(0); // Non deve importare indirizzi non validi

    fs.unlinkSync(invalidCSV); // Pulizia del file temporaneo
});