const express = require("express");
const { getKnowledge } = require("../controllers/knowledgeController");

const router = express.Router();

// Endpoint per ottenere informazioni dalla knowledge base
router.get("/query", getKnowledge);
router.get("/get", getKnowledge);

module.exports = router;