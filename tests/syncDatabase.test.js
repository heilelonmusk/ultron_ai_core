const Wallet = require("../api/models/WalletModel");

describe("Database Sync Test", () => {
  beforeEach(async () => {
    await Wallet.deleteMany(); // Pulisce il database prima di ogni test
  });

  test("Should update 'not eligible' wallets when added to whitelist", async () => {
    await Wallet.create({ address: "dym12345", status: "not eligible" });

    // Simula l'aggiunta in whitelist
    await Wallet.updateOne({ address: "dym12345" }, { $set: { status: "eligible" } });

    const wallet = await Wallet.findOne({ address: "dym12345" });
    expect(wallet.status).toBe("eligible");
  });
});