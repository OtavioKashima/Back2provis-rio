const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {

  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }

    req.usuarioId = decoded.id;

    next();
  });

}

module.exports = autenticar;