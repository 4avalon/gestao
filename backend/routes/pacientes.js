const express = require('express');
const {
  listarPacientes,
  adicionarPaciente,
  removerPaciente,
} = require('../controllers/pacienteController');

const router = express.Router();

// Rotas de pacientes
router.get('/', listarPacientes);
router.post('/', adicionarPaciente);
router.delete('/:id', removerPaciente);

module.exports = router;
