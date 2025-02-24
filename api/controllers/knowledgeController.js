const knowledgeBase = {
    "DYM": "Dymension is a modular blockchain optimized for rollups.",
    "HELON": "Helon is a memecoin built on Dymension RollApps."
  };
  
  const getKnowledge = async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter" });
    }
    const response = knowledgeBase[q.toUpperCase()] || "No information available.";
    res.json({ query: q, response });
  };
  
  module.exports = { getKnowledge };