// tests/syncDatabase.test.js
describe("Database Sync Test", () => {
  beforeEach(async () => {
    await Wallet.deleteMany();
  });

  test("Should update 'not eligible' wallets when added to whitelist", async () => {
    await Wallet.create({ address: "dym123456789", status: "not eligible" });
    await importCSV("tests/mocks/whitelist.csv", "eligible");
    const wallet = await Wallet.findOne({ address: "dym123456789" });
    expect(wallet.status).toBe("eligible");
  });
});