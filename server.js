require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importação das rotas
const usuarioRoutes = require('./routes/usuarioRoute');
const postagemRoutes = require('./routes/postagemRoute'); // 👈 Nova importação

const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Usando as rotas
app.use('/api', usuarioRoutes);
app.use('/api', postagemRoutes); // 👈 Adicionando as rotas de postagem na base /api

// O express.static cria uma "ponte pública" para a sua pasta uploads
app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});