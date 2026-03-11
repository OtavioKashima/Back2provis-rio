const express = require('express');
const router = express.Router();

// Importa o controller e o middleware
const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware');

// Rota POST protegida pelo token
router.post('/postagens', autenticar, postagemController.criarPostagem);

module.exports = router;