const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.perfil = (req, res) => {
  // O middleware de autenticação já colocou o ID do usuário logado aqui!
  const usuarioId = req.usuarioId;

  // Buscamos apenas os dados necessários (NUNCA retorne a senha!)
  const query = 'SELECT id, nome, telefone, foto_perfil FROM usuarios WHERE id = ?';

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar dados do usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Como o ID é único, o MySQL devolve um array com 1 item. 
    // Nós enviamos apenas esse item (results[0]) para o Angular.
    res.status(200).json(results[0]);
  });
};

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
  const usuarioId = req.usuarioId; // ID que vem do Token JWT
  const { nome, telefone } = req.body; // Dados de texto

  // 1. Verificamos se uma NOVA foto foi enviada
  if (req.file) {
    // 🔴 AQUI ESTÁ A CHAVE: req.file.filename é o nome que está na pasta uploads!
    const nomeArquivoNovo = req.file.filename; 
    console.log("Nova foto detectada e salva como:", nomeArquivoNovo);

    const query = 'UPDATE usuarios SET nome = ?, telefone = ?, foto_perfil = ? WHERE id = ?';
    
    db.query(query, [nome, telefone, nomeArquivoNovo, usuarioId], (err, results) => {
      if (err) {
        console.error("Erro SQL ao atualizar com foto:", err);
        return res.status(500).json({ erro: 'Erro interno ao atualizar perfil com foto.' });
      }
      
      console.log("Banco de dados atualizado com sucesso (Nome + Foto).");
      res.status(200).json({ 
        mensagem: 'Perfil e foto atualizados!', 
        foto: nomeArquivoNovo 
      });
    });

  } else {
    // 2. Caso o usuário mude apenas o nome ou telefone (sem trocar a foto)
    console.log("Nenhuma foto nova enviada. Atualizando apenas textos...");

    const query = 'UPDATE usuarios SET nome = ?, telefone = ? WHERE id = ?';
    
    db.query(query, [nome, telefone, usuarioId], (err, results) => {
      if (err) {
        console.error("Erro SQL ao atualizar textos:", err);
        return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
      }

      console.log("Banco de dados atualizado com sucesso (Apenas textos).");
      res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
    });
  }
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