const express = require('express');
const router = express.Router();

// Importa o controller e o middleware
const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware');

// Rota POST protegida pelo token
router.post('/postagens', autenticar, postagemController.criarPostagem);

// Rota para atualizar (PUT)
// O ":id" na URL vira o req.params.id lá no controller
router.put('/postagens/:id', autenticar, postagemController.atualizarPostagem);

// Rota para deletar (DELETE)
router.delete('/postagens/:id', autenticar, postagemController.deletarPostagem);

router.get('/postagens', autenticar, postagemController.listarPostagens);


module.exports = router;