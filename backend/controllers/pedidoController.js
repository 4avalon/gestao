const client = require('../config/db'); // Conexão com o banco de dados

// Listar todos os pedidos
const listarPedidos = async (req, res) => {
  console.log('📋 Requisição: Listar todos os pedidos.');
  try {
    const result = await client.query('SELECT * FROM pedidos');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Erro ao listar pedidos:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

const listarPedidosEmAberto = async (req, res) => {
  console.log("📋 Requisição: Listar apenas pedidos em aberto.");
  try {
    const result = await client.query(
      "SELECT * FROM pedidos WHERE status NOT IN ('Concluído', 'Cancelado') ORDER BY data_pagamento DESC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao listar pedidos em aberto:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};


// Adicionar um novo pedido
const adicionarPedido = async (req, res) => {
  const { paciente_id, descricao, status } = req.body;
  console.log('➕ Requisição: Adicionar pedido.', req.body);

  try {
    const result = await client.query(
      'INSERT INTO pedidos (paciente_id, descricao, status) VALUES ($1, $2, $3) RETURNING *',
      [paciente_id, descricao, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao adicionar pedido:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// Remover um pedido
const removerPedido = async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Requisição: Remover pedido com ID=${id}`);

  try {
    const result = await client.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      console.log('❌ Pedido não encontrado.');
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.status(200).json({ message: 'Pedido removido com sucesso.', pedido: result.rows[0] });
  } catch (err) {
    console.error('❌ Erro ao remover pedido:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

module.exports = {
  listarPedidos,
  listarPedidosEmAberto,  
  adicionarPedido,
  removerPedido,
};

