const express = require("express");
const { checkWallet } = require("../controllers/walletController");

const router = express.Router();

// Endpoint per verificare un wallet
router.get("/check/:address", checkWallet);

module.exports = router;