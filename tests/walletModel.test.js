// 🛠️ walletModel.test.js - Test per il modello Wallet
const Wallet = require("../api/models/WalletModel");
const { connectMongoDB, disconnectMongoDB } = require("../config/connectMongoDB");;

describe('🔍 Wallet Model', () => {
  beforeAll(async () => {
    await connectMongoDB();
    await Wallet.deleteMany();
  });

  test('✅ Should create a new wallet entry', async () => {
    const wallet = new Wallet({ address: 'dym123456', status: 'eligible' });
    const savedWallet = await wallet.save();
    expect(savedWallet.address).toBe('dym123456');
  });

  test('❌ Should not allow duplicate wallets', async () => {
    try {
      await new Wallet({ address: 'dym123456', status: 'eligible' }).save();
    } catch (error) {
      expect(error.code).toBe(11000); // Duplicate key error
    }
  });

  test('❌ Should enforce valid date format', async () => {
    try {
      await new Wallet({ address: 'dym987654', status: 'eligible', importedAt: 'Invalid Date' }).save();
    } catch (error) {
      expect(error.message).toMatch(/Cast to date failed/);
    }
  });
});
