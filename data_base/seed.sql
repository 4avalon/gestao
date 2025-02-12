-- 🔥 Deletar o banco existente (se existir) antes de recriar
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 🔹 Criar tabela de dentistas
CREATE TABLE IF NOT EXISTS dentistas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 Restaurar permissões padrão
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
