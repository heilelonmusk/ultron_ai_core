const express = require("express");
const { checkWallet } = require("../controllers/walletController");
const router = express.Router();

router.get("/check/:address", checkWallet);

module.exports = router;