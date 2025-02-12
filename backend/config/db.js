const { Client } = require('pg'); // Importação do PostgreSQL
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => console.log('✅ Conectado ao PostgreSQL com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao PostgreSQL:', err));

module.exports = client;
