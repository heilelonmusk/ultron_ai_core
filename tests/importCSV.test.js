const importCSV = require("../database/importCSV");
const Wallet = require("../api/models/WalletModel");

describe("CSV Import Test", () => {
  beforeEach(async () => {
    await Wallet.deleteMany(); // Rimuove i dati esistenti prima di ogni test
  });

  test("Should import whitelist.csv correctly", async () => {
    await importCSV("tests/mocks/whitelist.csv", "eligible");
    const count = await Wallet.countDocuments({ status: "eligible" });
    expect(count).toBeGreaterThan(0);
  });
});