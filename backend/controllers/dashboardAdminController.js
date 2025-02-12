const client = require("../config/db");
// 📌 1️⃣ **TABELA PRINCIPAL** - Lista geral de dentistas com pedidos vinculados
const listarDentistasDashboard = async (req, res) => {
    console.log("📋 Requisição: Listar dentistas para o Dashboard Admin");

    try {
        const result = await client.query(`
            SELECT 
                d.id, 
                d.nome, 
                d.is_admin::BOOLEAN AS is_admin, -- 🔥 Converte para booleano
                d.is_verified::BOOLEAN AS is_verified, -- 🔥 Converte para booleano
                COALESCE(COUNT(p.id), 0) AS total_pedidos,
                COALESCE(SUM(CASE WHEN p.status NOT IN ('Concluído', 'Cancelado') THEN 1 ELSE 0 END), 0) AS pedidos_abertos
            FROM dentistas d
            LEFT JOIN pedidos p ON d.id = p.dentista_id
            GROUP BY d.id
            ORDER BY d.id ASC
        `);

        console.log("✅ Dados retornados do banco:", JSON.stringify(result.rows, null, 2));
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ Erro ao listar dentistas para o dashboard:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};


// 📌 2️⃣ **DETALHES** - Exibe informações detalhadas de um dentista específico e possibilita toggles
const obterDetalhesDentista = async (req, res) => {
    const { id } = req.params;
    console.log(`🔍 Buscando detalhes do dentista ID=${id}`);

    try {
        const result = await client.query(`
            SELECT d.id, d.nome, d.email, d.telefone, d.is_admin, d.is_verified, 
                COUNT(p.id) AS total_pedidos,
                COUNT(CASE WHEN p.status NOT IN ('Concluído', 'Cancelado') THEN 1 END) AS pedidos_abertos
            FROM dentistas d
            LEFT JOIN pedidos p ON d.id = p.dentista_id
            WHERE d.id = $1
            GROUP BY d.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Erro ao buscar detalhes do dentista:", error);
        res.status(500).json({ message: "Erro ao buscar detalhes do dentista." });
    }
};

// ✅ **Alternar Status de Administrador**
const alternarAdmin = async (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Alternando status de Admin para dentista ID=${id}`);

    try {
        const result = await client.query("SELECT is_admin FROM dentistas WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        const novoStatus = !result.rows[0].is_admin;
        const updateResult = await client.query(
            "UPDATE dentistas SET is_admin = $1 WHERE id = $2 RETURNING is_admin",
            [novoStatus, id]
        );

        res.status(200).json({ message: "Status de Administrador atualizado com sucesso!", is_admin: updateResult.rows[0].is_admin });
    } catch (err) {
        console.error("❌ Erro ao alternar status de Admin:", err);
        res.status(500).json({ message: "Erro ao atualizar status de administrador." });
    }
};

// ✅ **Alternar Status de Credenciado**
const alternarCredenciado = async (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Alternando status de Credenciado para dentista ID=${id}`);

    try {
        const result = await client.query("SELECT is_verified FROM dentistas WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dentista não encontrado." });
        }

        const novoStatus = !result.rows[0].is_verified;
        const updateResult = await client.query(
            "UPDATE dentistas SET is_verified = $1 WHERE id = $2 RETURNING is_verified",
            [novoStatus, id]
        );

        res.status(200).json({ message: "Status de Credenciado atualizado com sucesso!", is_verified: updateResult.rows[0].is_verified });
    } catch (err) {
        console.error("❌ Erro ao alternar status de Credenciado:", err);
        res.status(500).json({ message: "Erro ao atualizar status de credenciamento." });
    }
};

// 📌 3️⃣ **TABELA DE PEDIDOS** - Exibe todos os pedidos cadastrados
const listarPedidosDashboard = async (req, res) => {
    console.log("📦 Requisição: Listar pedidos para o Dashboard Admin");

    try {
        const result = await client.query(`
            SELECT 
                p.id, 
                p.paciente_id, 
                CONCAT(pa.nome, ' (ID: ', pa.id, ')') AS paciente_nome, 
                p.dentista_id, 
                CONCAT(d.nome, ' (ID: ', d.id, ')') AS dentista_nome, 
                p.data_pagamento, 
                p.video_conferencia, 
                p.arquivo_3d, 
                p.ficha_tecnica, 
                p.status, 
                p.created_at
            FROM pedidos p
            JOIN dentistas d ON p.dentista_id = d.id
            JOIN pacientes pa ON p.paciente_id = pa.id -- 🔥 Puxando os pacientes corretamente
            ORDER BY p.created_at DESC
        `);

        console.log("✅ Dados retornados do banco:", result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ Erro ao listar pedidos para o dashboard:", err);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};


// 📌 **Alterar Status de um Pedido**
const alterarStatusPedido = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Atualizando status do pedido ID=${id} para '${status}'`);

    // Lista de status permitidos
    const statusPermitidos = ["Pendente", "Em andamento", "Aprovado", "Concluído", "Cancelado"];

    // Verifica se o status informado é válido
    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ message: `Status inválido. Os status permitidos são: ${statusPermitidos.join(", ")}` });
    }

    try {
        // Verifica se o pedido existe
        const pedidoExiste = await client.query("SELECT id FROM pedidos WHERE id = $1", [id]);
        if (pedidoExiste.rows.length === 0) {
            return res.status(404).json({ message: "Pedido não encontrado." });
        }

        // Atualiza o status do pedido
        await client.query(
            "UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING id, dentista_id, paciente_id, status",
            [status, id]
        );

        console.log(`✅ Status do pedido ID=${id} atualizado para '${status}'`);
        res.status(200).json({ message: "Status do pedido atualizado com sucesso!", pedido: { id, status } });

    } catch (error) {
        console.error("❌ Erro ao atualizar status do pedido:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};


// 📌 4️⃣ **ESTATÍSTICAS** - Dados agregados do sistema para visão geral do Admin
const obterEstatisticasAdmin = async (req, res) => {
    console.log("📊 Obtendo estatísticas do dashboard Admin...");
    try {
        const result = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM dentistas) AS total_dentistas,
                (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
                (SELECT COUNT(*) FROM pedidos) AS total_pedidos,
                (SELECT COUNT(*) FROM pedidos WHERE status NOT IN ('Concluído', 'Cancelado')) AS pedidos_abertos,
                (SELECT COUNT(*) FROM pedidos WHERE status = 'Concluído') AS pedidos_finalizados,
                (SELECT COUNT(*) FROM pedidos WHERE status = 'Cancelado') AS pedidos_cancelados,
                (SELECT COUNT(*) FROM dentistas WHERE is_verified = TRUE) AS total_dentistas_credenciados,
                (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '7 days') AS pedidos_ultimos_7_dias,
                (SELECT COUNT(*) FROM dentistas WHERE is_verified = TRUE AND created_at >= NOW() - INTERVAL '7 days') AS dentistas_credenciados_7_dias,
                (SELECT COUNT(*) FROM pedidos WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS pedidos_mes_atual,
                (SELECT COUNT(*) FROM dentistas WHERE is_verified = TRUE AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS dentistas_credenciados_mes_atual
        `);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Erro ao buscar estatísticas do Admin:", error);
        res.status(500).json({ message: "Erro ao buscar estatísticas do Admin." });
    }
};

// ✅ **EXPORTANDO TODOS OS MÓDULOS**
module.exports = {
    listarDentistasDashboard,
    obterDetalhesDentista,
    listarPedidosDashboard,
    alterarStatusPedido,
    obterEstatisticasAdmin,
    alternarAdmin,
    alternarCredenciado
};


