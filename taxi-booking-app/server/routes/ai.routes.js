
const express = require('express');
const router = express.Router();
const { generateText } = require('../controllers/ai.controller.js');

// Middleware de autenticación (opcional, pero recomendado)
// const { verifyToken } = require('../middleware'); // Descomenta si quieres proteger la ruta

// POST /api/ai/generate
// router.post('/generate', verifyToken, generateText); // Ruta protegida
router.post('/generate', generateText); // Ruta pública

module.exports = router;
