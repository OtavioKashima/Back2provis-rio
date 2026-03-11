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
  const tiposValidos = ['denuncia', 'doação', 'adoção'];
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