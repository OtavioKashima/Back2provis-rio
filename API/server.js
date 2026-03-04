require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// === Configuração do banco de dados ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'banco_tcc',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});

// === Configuração do armazenamento das imagens ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});
const upload = multer({ storage });

// ==================== Helpers / Config ====================
const JWT_SECRET = process.env.JWT_SECRET || 'troque_isso_em_producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 10;

// ==================== Middleware de autenticação ====================
function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ erro: 'Token não fornecido.' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido.' });
  }

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    req.usuarioId = decoded.id;
    next();
  });
}

// ==================== Rotas de usuário ====================

// Rota para cadastrar usuário
app.post('/usuarios', upload.single('foto_perfil'), async (req, res) => {
  try {
    const { nome, cpf, email, telefone, senha } = req.body;
    const foto_perfil = req.file ? req.file.filename : null;

    // Verifica campos obrigatórios
    if (!nome || !cpf || !senha) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, cpf e senha.' });
    }

    // Verifica se pelo menos um entre email ou telefone foi preenchido
    if (!email && !telefone) {
      return res.status(400).json({ erro: 'É necessário informar pelo menos um entre email ou telefone.' });
    }

    // Verifica se já existe um usuário com o mesmo CPF, e-mail ou telefone
    db.query(
      'SELECT id FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?',
      [cpf, email, telefone],
      async (err, rows) => {
        if (err) {
          console.error('Erro ao verificar usuário existente:', err);
          return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        if (rows.length > 0) {
          return res.status(409).json({ erro: 'Usuário já cadastrado com este CPF, email ou telefone.' });
        }

        // Gera o hash da senha
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        const sql = `
          INSERT INTO usuarios (nome, cpf, email, telefone, senha, foto_perfil)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [nome, cpf, email || null, telefone || null, senhaHash, foto_perfil], (err, result) => {
          if (err) {
            console.error('Erro ao inserir usuário:', err);
            return res.status(500).json({ erro: 'Erro ao inserir usuário no banco de dados.' });
          }

          res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: result.insertId,
            foto_perfil: foto_perfil ? `/uploads/${foto_perfil}` : null
          });
        });
      }
    );
  } catch (err) {
    console.error('Erro inesperado na rota /usuarios:', err);
    res.status(500).json({ erro: 'Erro inesperado.' });
  }
});

// Rota de login - autentica por CPF, email ou telefone
app.post('/login', (req, res) => {
  const { identificador, senha } = req.body;

  if (!identificador || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios: identificador (CPF, email ou telefone) e senha.' });
  }

  const sql = `
    SELECT id, senha FROM usuarios
    WHERE cpf = ? OR email = ? OR telefone = ?
    LIMIT 1
  `;
  db.query(sql, [identificador, identificador, identificador], async (err, rows) => {
    if (err) {
      console.error('Erro ao buscar usuário para login:', err);
      return res.status(500).json({ erro: 'Erro no servidor.' });
    }
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ mensagem: 'Autenticado com sucesso!', token });
  });
});

// === Rota para criar uma nova postagem ===
// Essa rota usa o ID do usuário autenticado (req.usuarioId) como usuarios_id automaticamente.
app.post('/postagens', autenticar, upload.single('foto'), (req, res) => {
  const { tipo_postagem, titulo, descricao, raca, genero, idade } = req.body;
  const foto = req.file ? req.file.filename : null;
  const usuarios_id = req.usuarioId;

  // Campos obrigatórios
  if (!tipo_postagem || !titulo || !descricao) {
    return res.status(400).json({ erro: 'Campos obrigatórios: tipo_postagem, titulo e descricao.' });
  }

  // Validações simples
  const tiposValidos = ['denuncia', 'doação', 'adoção'];
  if (!tiposValidos.includes(tipo_postagem)) {
    return res.status(400).json({ erro: 'Tipo de postagem inválido. Use: denuncia, doação ou adoção.' });
  }

  const generosValidos = ['feminino', 'masculino', 'desconhecido'];
  if (genero && !generosValidos.includes(genero)) {
    return res.status(400).json({ erro: 'Gênero inválido. Use: feminino, masculino ou desconhecido.' });
  }

  const data_criacao = new Date();

  const sql = `
    INSERT INTO postagens (tipo_postagem, titulo, descricao, raca, genero, idade, foto, data_criacao, usuarios_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [tipo_postagem, titulo, descricao, raca || null, genero || null, idade || null, foto || null, data_criacao, usuarios_id],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir postagem:', err);
        return res.status(500).json({ erro: 'Erro ao inserir postagem no banco de dados.' });
      }

      res.status(201).json({
        mensagem: 'Postagem criada com sucesso!',
        id: result.insertId,
        foto: foto ? `/uploads/${foto}` : null
      });
    }
  );
});

// ==================== Rota protegida (exemplo) ====================
app.get('/perfil', autenticar, (req, res) => {
  const usuarioId = req.usuarioId;
  db.query(
    'SELECT id, nome, cpf, email, telefone, foto_perfil FROM usuarios WHERE id = ?',
    [usuarioId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar perfil:', err);
        return res.status(500).json({ erro: 'Erro no servidor.' });
      }
      if (rows.length === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }
      res.json(rows[0]);
    }
  );
});

// === Servir as imagens estaticamente ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Iniciar o servidor ===
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// === Rota para deletar o próprio usuário ===
app.delete('/usuarios/:id', autenticar, (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuarioId; // vem do token

  // Impede que um usuário delete outro
  if (parseInt(id) !== usuarioId) {
    return res.status(403).json({ erro: 'Você só pode deletar sua própria conta.' });
  }

  // Primeiro, busca a foto pra excluir do diretório (se existir)
  db.query('SELECT foto_perfil FROM usuarios WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar usuário para exclusão:', err);
      return res.status(500).json({ erro: 'Erro no servidor.' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const foto = rows[0].foto_perfil;
    if (foto) {
      const caminhoFoto = path.join(__dirname, 'uploads', foto);
      fs.unlink(caminhoFoto, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Erro ao excluir foto:', err);
        }
      });
    }

    // Deleta o usuário
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ erro: 'Erro ao excluir usuário do banco de dados.' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      res.json({ mensagem: 'Usuário deletado com sucesso!' });
    });
  });
});
