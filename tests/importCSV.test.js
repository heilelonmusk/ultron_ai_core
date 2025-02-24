const Wallet = require("../api/models/WalletModel");
const { importCSV } = require("../database/importCSV");

describe("CSV Import Test", () => {
  beforeEach(async () => {
    await Wallet.deleteMany();
  });

  test("Should import whitelist.csv correctly", async () => {
    await importCSV("tests/mocks/whitelist.csv", "eligible");
    const count = await Wallet.countDocuments({ status: "eligible" });
    expect(count).toBeGreaterThan(0);
  });
});