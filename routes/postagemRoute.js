const express = require('express');
const router = express.Router();

const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware'); 

const upload = require('../middleware/configMulter');
// Rota POST protegida pelo token
router.post('/postagens', autenticar, upload.single('foto'), postagemController.criarPostagem);

// Rota para atualizar (PUT)
// O ":id" na URL vira o req.params.id lá no controller
router.put('/postagens/:id', autenticar, postagemController.atualizarPostagem);

// Rota para deletar (DELETE)
router.delete('/postagens/:id', autenticar, postagemController.deletarPostagem);

// Rota para buscar postagens por tipo específico
// O ":tipo" vai receber valores como "adoção", "doação" ou "denuncia"
router.get('/postagens/tipo/:tipo', postagemController.listarPorTipo);

router.get('/postperfil', autenticar, postagemController.PostagensPerfil);


module.exports = router;