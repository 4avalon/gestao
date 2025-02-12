const express = require("express");
const { 
    listarDentistasDashboard,
    obterDetalhesDentista,
    listarPedidosDashboard,
    alterarStatusPedido,
    obterEstatisticasAdmin,
    alternarAdmin,
    alternarCredenciado
} = require("../controllers/dashboardAdminController");

const { autenticarToken, autenticarAdmin } = require("../middlewares/auth");

const router = express.Router();

// 📌 1️⃣ **TABELA PRINCIPAL** - Lista geral de dentistas com pedidos vinculados
router.get("/dentistas/dashboard", autenticarToken, autenticarAdmin, listarDentistasDashboard);  

// 📌 2️⃣ **DETALHES** - Exibe informações detalhadas de um dentista específico e possibilita toggles
router.get("/dentistas/:id", autenticarToken, autenticarAdmin, obterDetalhesDentista);

// ✅ **Alterações de status (Toggles)**
router.patch("/dentistas/:id/toggle-is_admin", autenticarToken, autenticarAdmin, alternarAdmin);  
router.patch("/dentistas/:id/toggle-is_verified", autenticarToken, autenticarAdmin, alternarCredenciado);

// 📌 3️⃣ **TABELA DE PEDIDOS** - Exibe todos os pedidos cadastrados
router.get("/pedidos/dashboard", autenticarToken, autenticarAdmin, listarPedidosDashboard);
// 📌 **Rota para alterar status de um pedido**
router.patch("/pedidos/:id/status", autenticarToken, autenticarAdmin, alterarStatusPedido);


// 📌 4️⃣ **ESTATÍSTICAS** - Dados agregados do sistema para visão geral do Admin
router.get("/estatisticas", autenticarToken, autenticarAdmin, obterEstatisticasAdmin);

module.exports = router;
