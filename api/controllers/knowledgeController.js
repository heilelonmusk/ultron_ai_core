const Knowledge = require("../models/KnowledgeModel");

exports.getKnowledge = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  console.log("🔍 Ricerca nel database per query:", query);
  const knowledge = await Knowledge.findOne({ query });

  if (!knowledge) {
    console.log("❌ Nessun risultato trovato per:", query);
    console.log("📌 Contenuto attuale del database:", await Knowledge.find({})); // Debug
    return res.status(404).json({ error: "No knowledge found for query" });
  }

  console.log("✅ Risultato trovato:", knowledge);
  res.json({ response: knowledge.response });
};