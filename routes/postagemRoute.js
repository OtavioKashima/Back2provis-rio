const express = require('express');
const router = express.Router();

// Importa o controller e o middleware
const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  // 1. Onde salvar
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  // 2. Qual nome dar ao arquivo
  filename: function (req, file, cb) {
    // Extrai a extensão do arquivo original (ex: .jpg, .png)
    const extensao = path.extname(file.originalname);
    
    // Cria um nome único com a data atual + um número aleatório + a extensão
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9) + extensao;
    
    cb(null, nomeUnico);
  }
});
  
  const upload = multer({ storage: storage });

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