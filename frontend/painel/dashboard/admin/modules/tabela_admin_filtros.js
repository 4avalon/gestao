import { adminsData } from "./tabela_admin.js";

export function preencherFiltros(adminsData) {
    preencherFiltroNomes(adminsData);
    console.log("✅ Filtros preenchidos!");
}

function preencherFiltroNomes(adminsData) {
    const filtroNome = document.getElementById("filtro-nome");
    if (!filtroNome) return;

    filtroNome.innerHTML = `<option value="">Todos</option>`;
    const nomesUnicos = [...new Set(adminsData.map(admin => admin.nome))];

    nomesUnicos.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        filtroNome.appendChild(option);
    });

    console.log("✅ Filtro de nomes atualizado!");
}

export function aplicarFiltros(admin, filtroNome, filtroAdmin, filtroVerificado) {
    return (
        (filtroNome === "" || admin.nome === filtroNome) &&
        (filtroAdmin === "Todos" || (filtroAdmin === "✅ Sim" && admin.is_admin) || (filtroAdmin === "❌ Não" && !admin.is_admin)) &&
        (filtroVerificado === "Todos" || (filtroVerificado === "✅ Sim" && admin.is_verified) || (filtroVerificado === "❌ Não" && !admin.is_verified))
    );
}


export async function exibirDetalhes(id) {
    console.log(`🔍 Exibindo detalhes do dentista ID: ${id}`);

    // 🔄 Atualiza o <select> para garantir que a opção correta seja selecionada
    const select = document.getElementById("dentista-select");
    if (!select) {
        console.error("❌ Elemento <select> não encontrado.");
        return;
    }

    let option = select.querySelector(`option[value="${id}"]`);
    if (!option) {
        option = document.createElement("option");
        option.value = id;
        option.textContent = `Dentista ${id}`;
        select.appendChild(option);
    }

    select.value = id;

    // 🔄 Chama a função carregarDetalhesDentista() para buscar os detalhes na API
    console.log(`🔄 Buscando detalhes do dentista ID ${id} na API...`);
    await carregarDetalhesDentista();
     document.getElementById("marcador-detalhes").scrollIntoView({ behavior: "smooth", block: "start" });

    console.log(`✅ Detalhes do dentista ID ${id} carregados e exibidos!`);
}



export function atualizarTabela(adminsData) {
    console.log("🔄 Atualizando tabela com filtros...");

    const tabela = document.getElementById("tabela-admin");
    if (!tabela) {
        console.warn("⚠️ Tabela de administradores não encontrada!");
        return;
    }

    const filtroNome = document.getElementById("filtro-nome")?.value || "";
    const filtroAdmin = document.getElementById("filtro-admin")?.textContent.trim() || "Todos";
    const filtroVerificado = document.getElementById("filtro-verificado")?.textContent.trim() || "Todos";

    const adminsFiltrados = adminsData.filter(admin => aplicarFiltros(admin, filtroNome, filtroAdmin, filtroVerificado));

    tabela.innerHTML = "";
    adminsFiltrados.forEach(admin => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${admin.id}</td>
            <td>${admin.nome} (ID: ${admin.id})</td>
            <td>
                <button class="btn btn-detalhes" onclick="exibirDetalhes(${admin.id})">📄 Ver Detalhes</button>
            </td>
            <td>${admin.is_admin ? "✅ Sim" : "❌ Não"}</td>
            <td>${admin.is_verified ? "✅ Sim" : "❌ Não"}</td>
            <td>${admin.total_pedidos}</td>
            <td>${admin.pedidos_abertos}</td>
            <td><!-- Aqui setamos os botões de ação --></td>
        `;
        tabela.appendChild(row);
    });

    console.log("✅ Tabela atualizada com filtros aplicados!");
}

export function toggleFilter(btn) {
    if (btn.classList.contains("filter-todos")) {
        btn.classList.replace("filter-todos", "filter-sim");
        btn.textContent = "✅ Sim";
    } else if (btn.classList.contains("filter-sim")) {
        btn.classList.replace("filter-sim", "filter-nao");
        btn.textContent = "❌ Não";
    } else {
        btn.classList.replace("filter-nao", "filter-todos");
        btn.textContent = "Todos";
    }
}

export function adicionarEventosFiltros() {
    document.getElementById("filtro-admin")?.addEventListener("click", function () {
        toggleFilter(this);
        atualizarTabela(adminsData);
    });

    document.getElementById("filtro-verificado")?.addEventListener("click", function () {
        toggleFilter(this);
        atualizarTabela(adminsData);
    });

    document.getElementById("filtro-nome")?.addEventListener("change", function () {
        atualizarTabela(adminsData);
    });
}

export function adicionarEventosOrdenacao() {
    document.getElementById("ordenar-id")?.addEventListener("click", () => ordenarTabela("id"));
    document.getElementById("ordenar-pedidos-totais")?.addEventListener("click", () => ordenarTabela("total_pedidos"));
    document.getElementById("ordenar-pedidos-abertos")?.addEventListener("click", () => ordenarTabela("pedidos_abertos"));
}

let ordenacaoAtiva = "";
let ordemCrescente = true;

export function ordenarTabela(campo) {
    console.log(`🔄 Tentando ordenar pelo campo: ${campo}`);

    if (ordenacaoAtiva === campo) {
        ordemCrescente = !ordemCrescente;
    } else {
        ordenacaoAtiva = campo;
        ordemCrescente = true;
    }

    console.log(`📌 Ordenando ${campo} em ordem ${ordemCrescente ? "crescente" : "decrescente"}`);

    adminsData.sort((a, b) => ordemCrescente ? a[campo] - b[campo] : b[campo] - a[campo]);
    atualizarTabela(adminsData);
    console.log(`✅ Ordenação aplicada: ${campo}`);
}

window.exibirDetalhes = exibirDetalhes; // Expõe para o escopo global