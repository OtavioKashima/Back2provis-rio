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