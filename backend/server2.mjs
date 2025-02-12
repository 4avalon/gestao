const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client } = require('pg'); // Importação do PostgreSQL

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// ============================ Configurações Básicas ============================
app.use(cors({ origin: '*' })); // Permitir requisições de qualquer origem
app.use(express.json());

// ============================ Conexão com o Banco de Dados ============================
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => console.log('✅ Conectado ao PostgreSQL com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao PostgreSQL:', err));

// ============================ Rotas de Dentistas ============================

// Listar todos os dentistas
app.get('/dentistas', async (req, res) => {
  console.log('📋 Requisição: Listar todos os dentistas.');
  try {
    const result = await client.query('SELECT * FROM dentistas');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Erro ao listar dentistas:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Adicionar um novo dentista
app.post('/dentistas', async (req, res) => {
  const { nome, email, telefone, senha } = req.body;
  console.log('➕ Requisição: Adicionar dentista.', req.body);

  try {
    const result = await client.query(
      'INSERT INTO dentistas (nome, email, telefone, senha) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, senha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao adicionar dentista:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Login do dentista
app.post('/dentistas/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log(`🔑 Requisição: Login com email: ${email}`);

  try {
    const result = await client.query('SELECT * FROM dentistas WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      console.log('❌ Dentista não encontrado.');
      return res.status(404).json({ message: 'Email ou senha incorretos.' });
    }

    const dentista = result.rows[0];
    if (dentista.senha !== senha) {
      console.log('❌ Senha incorreta.');
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    console.log(`✅ Login bem-sucedido para ${dentista.nome}`);
    res.status(200).json({ message: 'Login bem-sucedido', dentista });
  } catch (err) {
    console.error('❌ Erro ao realizar login:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Remover um dentista
app.delete('/dentistas/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Requisição: Remover dentista com ID=${id}`);

  try {
    const result = await client.query('DELETE FROM dentistas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      console.log('❌ Dentista não encontrado.');
      return res.status(404).json({ message: 'Dentista não encontrado.' });
    }
    res.status(200).json({ message: 'Dentista removido com sucesso.', dentista: result.rows[0] });
  } catch (err) {
    console.error('❌ Erro ao remover dentista:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// ============================ Inicialização do Servidor ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
