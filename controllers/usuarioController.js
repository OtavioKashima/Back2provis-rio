const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.cadastrar = async (req, res) => {

  const { nome, cpf, email, telefone, senha } = req.body;

  if (!nome || !cpf || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }

  db.query(
    'SELECT id FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?',
    [cpf, email, telefone],
    async (err, rows) => {

      if (rows.length > 0) {
        return res.status(409).json({ erro: 'Usuário já cadastrado' });
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      db.query(
        'INSERT INTO usuarios (nome,cpf,email,telefone,senha) VALUES (?,?,?,?,?)',
        [nome, cpf, email, telefone, senhaHash],
        (err, result) => {

          if (err) {
            return res.status(500).json({ erro: 'Erro ao cadastrar' });
          }

          res.status(201).json({
            mensagem: 'Usuário cadastrado',
            id: result.insertId
          });

        }
      );

    }
  );

};

exports.login = (req, res) => {

  const { identificador, senha } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?',
    [identificador, identificador, identificador],
    async (err, rows) => {

      if (rows.length === 0) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const usuario = rows[0];

      const match = await bcrypt.compare(senha, usuario.senha);

      if (!match) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        token
      });

    }
  );

};

// ATUALIZAR USUÁRIO (Update)
exports.atualizar = (req, res) => {
  // Pegamos os dados que o usuário quer mudar
  const { nome, email, telefone } = req.body;
  
  // Pegamos o ID diretamente do token (segurança máxima!)
  const usuarioId = req.usuarioId; 

  // Validação básica
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios para atualizar.' });
  }

  const query = 'UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?';
  
  db.query(query, [nome, email, telefone, usuarioId], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar:", err);
      return res.status(500).json({ erro: 'Erro ao atualizar o perfil.' });
    }

    res.json({ mensagem: 'Perfil atualizado com sucesso!' });
  });
};

// DELETAR USUÁRIO (Delete) por token
exports.deletar = (req, res) => {
  // Pegamos o ID do token
  const usuarioId = req.usuarioId; 

  const query = 'DELETE FROM usuarios WHERE id = ?';

  db.query(query, [usuarioId], (err, result) => {
    if (err) {
      console.error("Erro ao deletar:", err);
      return res.status(500).json({ erro: 'Erro ao deletar a conta.' });
    }

    res.json({ mensagem: 'Conta deletada com sucesso!' });
  });
};