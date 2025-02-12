// src/middlewares/validate.js
import { check, validationResult } from 'express-validator';

// Validação para adicionar ou atualizar dentistas
export const validateDentista = [
  check('nome').notEmpty().withMessage('O nome é obrigatório'),
  check('email').isEmail().withMessage('O email precisa ser válido'),
  check('telefone').notEmpty().withMessage('O telefone é obrigatório'),
  check('senha').notEmpty().withMessage('A senha é obrigatória'),
];

// Validação para adicionar ou atualizar pacientes
export const validatePaciente = [
  check('nome').notEmpty().withMessage('O nome é obrigatório'),
  check('email').isEmail().withMessage('O email precisa ser válido'),
  check('telefone').notEmpty().withMessage('O telefone é obrigatório'),
  check('dentista_id').isInt().withMessage('O ID do dentista deve ser um número válido'),
];

// Validação para adicionar ou atualizar pedidos
export const validatePedido = [
  check('paciente_id').isInt().withMessage('O ID do paciente deve ser um número válido'),
  check('pedido_details').notEmpty().withMessage('Os detalhes do pedido são obrigatórios'),
];

// Middleware para verificar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
