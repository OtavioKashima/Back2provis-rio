const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController'); 
const autenticar = require('../middleware/authMiddleware'); 
const upload = require('../middleware/configMulter');

// 👈 Adicione o upload.single('foto_perfil') antes do controller
// 'foto_perfil' é exatamente o nome que você usou no formData.append do Ionic
router.post('/usuarios', upload.single('foto_perfil'), usuarioController.cadastrar);

router.post('/login', usuarioController.login);

router.put('/perfiledit', autenticar, upload.single('foto'), usuarioController.atualizar);

// Rota para Deletar o usuário logado
router.delete('/perfildelete', autenticar, usuarioController.deletar);

router.get('/perfil', autenticar, usuarioController.perfil);

// router.post('/admin', usuarioController)

router.get('/perfil', autenticar, (req, res)=>{
  res.json({
    mensagem: "Rota protegida funcionando",
    usuario: req.usuarioId
  })
});

module.exports = router;