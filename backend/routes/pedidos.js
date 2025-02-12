const express = require('express');
const {
  listarPedidos,
  listarPedidosEmAberto,
  adicionarPedido,
  removerPedido,
} = require('../controllers/pedidoController');

const router = express.Router();

// Rotas de pedidos
router.get('/', listarPedidos);
router.get('/abertos', listarPedidosEmAberto);
router.post('/', adicionarPedido);
router.delete('/:id', removerPedido);

module.exports = router;
