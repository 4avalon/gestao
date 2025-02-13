import { preencherFiltros, exibirDetalhes, atualizarTabela, adicionarEventosFiltros, adicionarEventosOrdenacao } from './tabela_admin_filtros.js';

console.log("[Admin] 🔥 Script tabela_admin.js carregado corretamente!");

export let adminsData = [];


async function carregarAdmins() {
    console.log("[Admin] 🔄 Iniciando carregamento dos administradores...");

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Usuário não autenticado! Redirecionando para login.");
            window.location.href = "/login.html";
            return;
        }

        console.log("🔍 Enviando requisição para buscar administradores...");
        const apiResponse = await fetch("http://localhost:5000/admin/dentistas/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!apiResponse.ok) {
            throw new Error(`❌ Erro ao carregar administradores. Status: ${apiResponse.status}`);
        }

        adminsData = await apiResponse.json();
        console.log("✅ Administradores recebidos:", adminsData);

        preencherFiltros(adminsData);
        atualizarTabela(adminsData);
        adicionarEventosFiltros();
        adicionarEventosOrdenacao();
    } catch (error) {
        console.error("❌ Erro ao carregar administradores:", error);
        document.getElementById("tabela-admin").innerHTML = `<tr><td colspan="8" style="color: red;">Erro ao carregar administradores.</td></tr>`;
    }
}



// 🔥 Chama a função ao carregar a página
carregarAdmins();

