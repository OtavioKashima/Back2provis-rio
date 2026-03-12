const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 Importe o Multer

const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middleware/authMiddleware');

// 👈 Configure onde as fotos serão salvas temporariamente
const upload = multer({ dest: 'uploads/' }); 

// 👈 Adicione o upload.single('foto_perfil') antes do controller
// 'foto_perfil' é exatamente o nome que você usou no formData.append do Ionic
router.post('/usuarios', upload.single('foto_perfil'), usuarioController.cadastrar);

router.post('/login', usuarioController.login);

router.put('/perfil', autenticar, usuarioController.atualizar);

// Rota para Deletar o usuário logado
router.delete('/perfil', autenticar, usuarioController.deletar);

router.get('/perfil', autenticar, (req, res)=>{
  res.json({
    mensagem: "Rota protegida funcionando",
    usuario: req.usuarioId
  })
});

module.exports = router;