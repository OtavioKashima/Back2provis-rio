const db = require('../config/db');

exports.criarPostagem = (req, res) => {
  // Recebe os dados do corpo da requisição (front-end)
  const {
    tipo_postagem,
    titulo,
    descricao,
    raca,
    genero,
    idade,
    foto // Se for enviar apenas o nome/URL do arquivo por enquanto
  } = req.body;

  // O ID do usuário vem do token (middleware de autenticação)
  const usuarios_id = req.usuarioId;

  // 1. Validação de campos obrigatórios (conforme seu banco de dados)
  if (!tipo_postagem || !titulo || !descricao) {
    return res.status(400).json({ erro: 'Os campos tipo de postagem, título e descrição são obrigatórios.' });
  }

  // 2. Validação do ENUM do tipo_postagem
  const tiposValidos = ['denuncia', 'doacao', 'adocao'];
  if (!tiposValidos.includes(tipo_postagem.toLowerCase())) {
    return res.status(400).json({ erro: 'Tipo de postagem inválido.' });
  }

  // 3. Pegar a data atual no formato YYYY-MM-DD para o campo data_criacao
  const data_criacao = new Date().toISOString().split('T')[0];

  // 4. Query de inserção
  const query = `
    INSERT INTO postagens 
    (tipo_postagem, titulo, descricao, raca, genero, idade, foto, data_criacao, usuarios_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Se algum campo opcional não for enviado, mandamos null para o banco
  const valores = [
    tipo_postagem.toLowerCase(),
    titulo,
    descricao,
    raca || null,
    genero || null,
    idade || null,
    foto || null,
    data_criacao,
    usuarios_id
  ];

  // Executar a query
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error("❌ Erro ao criar postagem:", err);
      return res.status(500).json({ erro: 'Erro interno ao salvar a postagem.' });
    }

    res.status(201).json({
      mensagem: 'Postagem criada com sucesso!',
      id_postagem: result.insertId
    });
  });
};

exports.atualizarPostagem = (req, res) => {
  const postId = req.params.id; // Pega o ID da postagem pela URL (ex: /postagens/5)
  const usuarioId = req.usuarioId; // Pega o ID do usuário logado (veio do Token)

  // Pegamos os dados novos que vieram do aplicativo
  const { titulo, descricao, tipo_postagem, raca, genero, idade } = req.body;

  // A query exige que o ID da postagem seja o correto E que o dono seja o usuário logado
  const query = `
    UPDATE postagens 
    SET titulo = ?, descricao = ?, tipo_postagem = ?, raca = ?, genero = ?, idade = ? 
    WHERE id = ? AND usuarios_id = ?
  `;

  db.query(query, [titulo, descricao, tipo_postagem, raca, genero, idade, postId, usuarioId], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar postagem:", err);
      return res.status(500).json({ erro: 'Erro interno ao atualizar postagem.' });
    }

    // Se affectedRows for 0, ou a postagem não existe, ou não pertence a esse usuário
    if (result.affectedRows === 0) {
      return res.status(403).json({ erro: 'Postagem não encontrada ou você não tem permissão para editá-la.' });
    }

    res.json({ mensagem: 'Postagem atualizada com sucesso!' });
  });
};

// DELETAR POSTAGEM
exports.deletarPostagem = (req, res) => {
  const postId = req.params.id;
  const usuarioId = req.usuarioId;

  // Deleta apenas se o ID bater E o dono for quem está pedindo
  const query = 'DELETE FROM postagens WHERE id = ? AND usuarios_id = ?';

  db.query(query, [postId, usuarioId], (err, result) => {
    if (err) {
      console.error("Erro ao deletar postagem:", err);
      return res.status(500).json({ erro: 'Erro interno ao deletar postagem.' });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ erro: 'Postagem não encontrada ou você não tem permissão para deletá-la.' });
    }

    res.json({ mensagem: 'Postagem deletada com sucesso!' });
  });
};

// LISTAR POSTAGENS POR TIPO
exports.listarPorTipo = (req, res) => {
  // Pega o tipo da URL (ex: adocao, doacao, denuncia)
  const tipo = req.params.tipo; 

  // Busca no banco apenas as postagens daquele tipo e ordena das mais novas para as mais velhas
  const query = 'SELECT * FROM postagens WHERE tipo_postagem = ? ORDER BY data_criacao DESC';

  db.query(query, [tipo], (err, results) => {
    if (err) {
      console.error("Erro ao listar postagens por tipo:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar postagens.' });
    }
    
    // Se não tiver nenhuma postagem desse tipo, podemos devolver um array vazio
    if (results.length === 0) {
      return res.json([]); 
    }

    res.json(results);
  });
};