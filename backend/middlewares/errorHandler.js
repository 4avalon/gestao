// src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(`❌ Erro no servidor: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Esconde stack em produção
  });
};
