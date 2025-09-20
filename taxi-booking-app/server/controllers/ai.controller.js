
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Asegúrate de tener GOOGLE_API_KEY en tu archivo .env del servidor
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateText = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es requerido." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error("Error al generar texto con Gemini:", error);
    res.status(500).json({ error: "Error al contactar con la API de IA." });
  }
};

module.exports = {
  generateText,
};
