const express = require('express');
const router = express.Router();

// Importa o controller e o middleware
const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware');
const multer = require('multer'); // 👈 1. Importa o Multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // A pasta que você acabou de criar
    },
    filename: function (req, file, cb) {
      // Renomeia o arquivo com a data para não ter nomes duplicados
      cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); 
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


module.exports = router;