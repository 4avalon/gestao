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

-- 🔹 Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    dentista_id INTEGER NOT NULL REFERENCES dentistas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 Criar tabela de pedidos
-- 🔹 Criar tabela de pedidos (corrigida)
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    dentista_id INTEGER NOT NULL REFERENCES dentistas(id) ON DELETE CASCADE,
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    video_conferencia BOOLEAN DEFAULT FALSE,
    arquivo_3d TEXT,
    ficha_tecnica JSONB,
    status VARCHAR(20) CHECK (status IN ('Pendente', 'Em Análise', 'Aprovado', 'Rejeitado', 'Concluído', 'Cancelado')) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 Restaurar permissões padrão
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 🔹 Inserir dados na tabela de dentistas
-- 🔹 Inserir dados na tabela de dentistas
INSERT INTO dentistas (nome, email, telefone, senha, is_admin, is_verified) 
VALUES 
    ('Pedro01', 'pedro01@gmail.com', '9999-9999', '123', TRUE, TRUE),
    ('Pedro02', 'pedro02@gmail.com', '8888-8888', '123', FALSE, TRUE),
    ('Pedro03', 'pedro03@gmail.com', '7777-7777', '123', FALSE, FALSE);

-- 🔹 Inserir clientes e pedidos conforme especificado

-- Pedro01 (1 cliente, 1 pedido)
INSERT INTO pacientes (dentista_id, nome, cpf, data_nascimento, sexo)
VALUES 
    (1, 'João Silva', '111.222.333-44', '1990-05-10', 'M');

INSERT INTO pedidos (dentista_id, paciente_id, video_conferencia, arquivo_3d, ficha_tecnica, status)
VALUES 
    (1, 1, TRUE, 'link_3d_model_joao', '{"procedimento": "Alinhador", "quantidade": 5}', 'Em Análise');  -- Status Variado

-- Pedro02 (2 clientes, 2 pedidos)
INSERT INTO pacientes (dentista_id, nome, cpf, data_nascimento, sexo)
VALUES 
    (2, 'Maria Souza', '222.333.444-55', '1985-08-15', 'F'),
    (2, 'Carlos Lima', '333.444.555-66', '1995-02-20', 'M');

INSERT INTO pedidos (dentista_id, paciente_id, video_conferencia, arquivo_3d, ficha_tecnica, status)
VALUES 
    (2, 2, FALSE, 'link_3d_model_maria', '{"procedimento": "Prótese", "quantidade": 2}', 'Concluído'), -- Status Variado
    (2, 3, TRUE, 'link_3d_model_carlos', '{"procedimento": "Aparelho Fixo", "quantidade": 1}', 'Cancelado'); -- Status Variado

-- 🔹 Outros dentistas para testes (se desejar mais registros)
INSERT INTO dentistas (nome, email, telefone, senha, is_admin, is_verified) 
VALUES 
    ('Ana Dentista', 'ana.dentista@gmail.com', '5555-5555', '123', TRUE, TRUE),
    ('Lucas Moreira', 'lucas.moreira@gmail.com', '4444-4444', '123', FALSE, TRUE),
    ('Mariana Lopes', 'mariana.lopes@gmail.com', '3333-3333', '123', FALSE, FALSE),
    ('Ricardo Santos', 'ricardo.santos@gmail.com', '2222-2222', '123', FALSE, TRUE);

-- 🔹 Adicionando mais pacientes para testes
INSERT INTO pacientes (dentista_id, nome, cpf, data_nascimento, sexo)
VALUES 
    (4, 'Fernanda Alves', '444.555.666-77', '1992-06-25', 'F'),
    (5, 'Roberto Farias', '555.666.777-88', '1980-11-03', 'M');

-- 🔹 Adicionando mais pedidos para testes (status variados)
INSERT INTO pedidos (dentista_id, paciente_id, video_conferencia, arquivo_3d, ficha_tecnica, status)
VALUES 
    (4, 4, TRUE, 'link_3d_model_fernanda', '{"procedimento": "Lente de Contato", "quantidade": 6}', 'Pendente'), -- Status Variado
    (5, 5, FALSE, NULL, '{"procedimento": "Extração", "quantidade": 2}', 'Aprovado'); -- Status Variado


-- 🔹 Consultas para visualizar os dados
SELECT * FROM dentistas ORDER BY id;
SELECT * FROM pacientes ORDER BY id;
SELECT * FROM pedidos ORDER BY id;
