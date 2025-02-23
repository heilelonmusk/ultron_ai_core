const checkWallet = async (req, res) => {
    const { address } = req.params;
  
    // Simuliamo un database di whitelist
    const whitelist = ["0x1234567890ABCDEF", "0xFEDCBA0987654321"];
  
    if (whitelist.includes(address)) {
      return res.json({ status: "eligible", address });
    } else {
      return res.json({ status: "not eligible", address });
    }
  };
  
  module.exports = { checkWallet };