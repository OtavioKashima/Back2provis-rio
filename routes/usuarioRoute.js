const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middleware/authMiddleware');

router.post('/usuarios', usuarioController.cadastrar);
router.post('/login', usuarioController.login);

router.get('/perfil', autenticar, (req,res)=>{
  res.json({
    mensagem: "Rota protegida funcionando",
    usuario: req.usuarioId
  })
});

module.exports = router;