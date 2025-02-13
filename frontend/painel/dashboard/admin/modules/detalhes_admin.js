console.log("[Detalhes Dentista] 🔥 Script detalhes_admin.js carregado corretamente!");

// ✅ Função para carregar a lista de dentistas no <select>
async function carregarDentistasParaSelecao() {
    console.log("[Detalhes Dentista] 🔄 Carregando lista de dentistas...");

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Usuário não autenticado! Redirecionando para login.");
            window.location.href = "/login.html";
            return;
        }

        const response = await fetch("http://localhost:5000/admin/dentistas/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar dentistas. Status: ${response.status}`);
        }

        const dentistas = await response.json();
        console.log("✅ Dentistas recebidos:", dentistas);

        const select = document.getElementById("dentista-select");
        if (!select) {
            console.error("❌ Elemento <select> não encontrado.");
            return;
        }

        // 🔄 Limpa o select antes de adicionar novos dentistas
        select.innerHTML = `<option value="">Selecione...</option>`;
        dentistas.forEach(dentista => {
            const option = document.createElement("option");
            option.value = dentista.id;
            option.textContent = ` ${dentista.id} - ${dentista.nome} `;
            select.appendChild(option);
        });

        console.log("✅ Select atualizado com dentistas disponíveis.");

    } catch (error) {
        console.error("❌ Erro ao carregar dentistas:", error);
    }
}

// ✅ Função para carregar os detalhes do dentista selecionado
async function carregarDetalhesDentista() {
    console.log("[Detalhes Dentista] 🔄 Buscando detalhes do dentista selecionado...");

    const select = document.getElementById("dentista-select");
    const dentistaId = select.value;

    if (!dentistaId) {
        console.warn("⚠️ Nenhum dentista selecionado.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/admin/dentistas/${dentistaId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar detalhes. Status: ${response.status}`);
        }

        const dentista = await response.json();
        console.log("✅ Detalhes do dentista recebidos:", dentista);

        // 📝 Atualiza os campos no HTML com os dados do dentista
        document.getElementById("dentista-nome").textContent = dentista.nome;
        document.getElementById("dentista-email").textContent = dentista.email;
        document.getElementById("dentista-telefone").textContent = dentista.telefone;
        document.getElementById("dentista-total-pedidos").textContent = dentista.total_pedidos;
        document.getElementById("dentista-pedidos-abertos").textContent = dentista.pedidos_abertos;
        document.getElementById("dentista-admin").textContent = dentista.is_admin ? "✅ Sim" : "❌ Não";
        document.getElementById("dentista-credenciado").textContent = dentista.is_verified ? "✅ Sim" : "❌ Não";

        // 🔥 Exibe os detalhes do dentista
        document.getElementById("detalhes-dentista").style.display = "block";
        document.querySelector(".modificar-credenciais").style.display = "block";

        // 🔄 Garante que os botões de modificação estão atualizados
        document.getElementById("toggle-admin").onclick = () => alterarAdmin(dentista.id, dentista.is_admin);
        document.getElementById("toggle-credenciado").onclick = () => alterarCredenciado(dentista.id, dentista.is_verified);

    } catch (error) {
        console.error("❌ Erro ao carregar detalhes do dentista:", error);
    }
}

// ✅ Função para alternar status de administrador
async function alterarAdmin(id, atual) {
    console.log(`🔄 Alterando permissão de admin para o ID ${id}...`);
    
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5000/admin/dentistas/${id}/toggle-is_admin`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao alterar status do admin. Status: ${response.status}`);
        }

        console.log(`✅ Status do admin ID ${id} alterado com sucesso!`);
        carregarDetalhesDentista(); // 🔄 Atualiza a exibição dos detalhes

    } catch (error) {
        console.error(`❌ Erro ao alterar status do admin ID ${id}:`, error);
    }
}

// ✅ Função para alternar credenciamento do dentista
async function alterarCredenciado(id, atual) {
    console.log(`🔄 Alternando status de credenciamento para o dentista ID ${id}...`);

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5000/admin/dentistas/${id}/toggle-is_verified`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao alternar credenciamento. Status: ${response.status}`);
        }

        console.log(`✅ Credenciamento do dentista ID ${id} alterado com sucesso!`);
        carregarDetalhesDentista(); // 🔄 Atualiza a exibição dos detalhes

    } catch (error) {
        console.error(`❌ Erro ao alternar credenciamento ID ${id}:`, error);
    }
}

// ✅ **Garantindo que os eventos sejam adicionados corretamente**
document.addEventListener("DOMContentLoaded", () => {
    console.log("[Detalhes Dentista] 🚀 Inicializando funcionalidades...");

    carregarDentistasParaSelecao();

    // ✅ Garante que o botão "Carregar Detalhes" seja vinculado corretamente
    const botaoCarregar = document.getElementById("carregar-detalhes");
    if (botaoCarregar) {
        botaoCarregar.addEventListener("click", carregarDetalhesDentista);
        console.log("✅ Evento de clique vinculado ao botão 'Carregar Detalhes'");
    } else {
        console.error("❌ Botão 'Carregar Detalhes' não encontrado!");
    }
});
window.carregarDentistasParaSelecao = carregarDentistasParaSelecao;
window.carregarDetalhesDentista = carregarDetalhesDentista;