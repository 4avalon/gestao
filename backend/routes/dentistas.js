const express = require("express");
const {
    listarDentistas,
    visualizarDentista,
    adicionarDentista,
    alterarDentista,
    removerDentista,
    loginDentista
} = require("../controllers/dentistaController");

const { autenticarToken, autenticarAdmin, autenticarDentista } = require("../middlewares/auth");

const router = express.Router();

// 🔑 Login e Cadastro (Acesso público)
router.post("/login", loginDentista);  // Qualquer um pode logar
router.post("/", adicionarDentista);   // Qualquer um pode se cadastrar

// 📋 Rotas de dentistas (Protegidas)
router.get("/", autenticarToken, autenticarAdmin, listarDentistas);  // Apenas ADMIN pode listar todos
router.get("/:id", autenticarToken, visualizarDentista);  // Dentistas autenticados podem ver seu próprio perfil
router.put("/:id", autenticarToken, autenticarDentista, alterarDentista);  // Dentista pode alterar seu próprio cadastro
router.delete("/:id", autenticarToken, autenticarAdmin, removerDentista);  // Apenas ADMIN pode remover dentistas

module.exports = router;
