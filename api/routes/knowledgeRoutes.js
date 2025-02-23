const express = require("express");
const { getKnowledge } = require("../controllers/knowledgeController");
const router = express.Router();

router.get("/query", getKnowledge);

module.exports = router;