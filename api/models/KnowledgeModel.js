const mongoose = require("mongoose");

// 📌 Definizione del modello Knowledge
const KnowledgeSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true, // Evita duplicati
    index: true, // Ottimizza le ricerche
  },
  response: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Salva la data di creazione
  },
});

// 📌 Crea il modello e lo esporta
const KnowledgeModel = mongoose.model("Knowledge", KnowledgeSchema);
module.exports = KnowledgeModel;