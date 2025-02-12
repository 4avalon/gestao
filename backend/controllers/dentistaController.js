const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const client = require("../config/db");

const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 Listar todos os dentistas (Apenas ADMIN)
const listarDentistas = async (req, res) => {
    console.log("📋 Requisição: Listar todos os dentistas.");
    try {
        if (!req.usuario.is_admin) {
            return res.status(403).json({ message: "Acesso negado. Apenas administradores podem visualizar dentistas." });
        }

        const result = await client.query("SELECT id, nome, email, telefone, is_admin, is_verified FROM dentistas");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ Erro ao listar dentistas:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// 🔹 Visualizar detalhes de um dentista (ADMIN)
const visualizarDentista = async (req, res) => {
    const { id } = req.params;
    console.log(`🔍 Buscando detalhes do dentista ID=${id}`);

    try {
        const result = await client.query(
            `SELECT d.id, d.nome, d.email, d.telefone, d.is_verified, 
            COUNT(p.id) AS total_pedidos,
            COUNT(CASE WHEN p.status NOT IN ('Concluído', 'Cancelado') THEN 1 END) AS pedidos_abertos
            FROM dentistas d
            LEFT JOIN pedidos p ON d.id = p.dentista_id
            WHERE d.id = $1
            GROUP BY d.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Erro ao buscar dentista:", error);
        res.status(500).json({ message: "Erro ao buscar dentista." });
    }
};

// 🔹 Adicionar um novo dentista (ADMIN)
const adicionarDentista = async (req, res) => {
    const { nome, email, telefone, senha } = req.body;
    console.log("➕ Requisição: Adicionar dentista.", req.body);

    try {
        // 🔹 Hash da senha (mantendo comentado para testes rápidos)
        const senhaHash = await bcrypt.hash(senha, 10);

        const result = await client.query(
            "INSERT INTO dentistas (nome, email, telefone, senha, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, telefone, is_verified",
            [nome, email, telefone, senhaHash, false]
        );

        res.status(201).json({ message: "Dentista cadastrado com sucesso!", dentista: result.rows[0] });
    } catch (err) {
        console.error("❌ Erro ao adicionar dentista:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// 🔹 Alterar dados do dentista (ADMIN)
const alterarDentista = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, email, senha } = req.body;
    console.log(`✏️ Requisição: Alterar dentista com ID=${id}`);

    try {
        let senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;

        const result = await client.query(
            "UPDATE dentistas SET nome = $1, telefone = $2, email = $3, senha = COALESCE($4, senha) WHERE id = $5 RETURNING id, nome, email, telefone, is_admin",
            [nome, telefone, email, senhaHash, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        res.status(200).json({ message: "Dentista atualizado com sucesso.", dentista: result.rows[0] });
    } catch (err) {
        console.error("❌ Erro ao alterar dentista:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// 🔹 Remover um dentista (Apenas ADMIN)
const removerDentista = async (req, res) => {
    if (!req.usuario.is_admin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem remover dentistas." });
    }
    const { id } = req.params;
    console.log(`🗑️ Requisição: Remover dentista com ID=${id}`);

    try {
        const result = await client.query("DELETE FROM dentistas WHERE id = $1 RETURNING id, nome, email", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        res.status(200).json({ message: "Dentista removido com sucesso.", dentista: result.rows[0] });
    } catch (err) {
        console.error("❌ Erro ao remover dentista:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

/// 🔹 Login do dentista (ADMIN)
const loginDentista = async (req, res) => {
    const { email, senha } = req.body;
    console.log(`🔑 Requisição: Login com email: ${email}`);

    try {
        const result = await client.query("SELECT * FROM dentistas WHERE LOWER(email) = LOWER($1)", [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Email ou senha incorretos." });
        }

        const dentista = result.rows[0];

        // 🔽 Comparação sem bcrypt (Apenas para testes)
        if (senha !== dentista.senha) {
            return res.status(401).json({ message: "Email ou senha incorretos." });
        }

        /**
        // 🔒 Comparação segura com bcrypt (Descomente quando for usar senhas criptografadas)
        const senhaValida = await bcrypt.compare(senha, dentista.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: "Email ou senha incorretos." });
        }
        **/

        const token = jwt.sign(
            { id: dentista.id, email: dentista.email, is_admin: dentista.is_admin, is_verified: dentista.is_verified },
            SECRET_KEY,
            { expiresIn: "2h", algorithm: "HS256" }
        );

        res.status(200).json({ message: "Login bem-sucedido", token, dentista });
    } catch (err) {
        console.error("❌ Erro ao realizar login:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};


module.exports = {
    listarDentistas,
    visualizarDentista,
    adicionarDentista,
    alterarDentista,
    removerDentista,
    loginDentista,
};
