console.log("[Admin] 🔥 Script tabela_admin.js carregado corretamente!");

let adminsData = []; // Armazena os administradores carregados

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

        preencherFiltroNomes(); 
        atualizarTabela(); 

    } catch (error) {
        console.error("❌ Erro ao carregar administradores:", error);
        document.getElementById("tabela-admin").innerHTML = `<tr><td colspan="8" style="color: red;">Erro ao carregar administradores.</td></tr>`;
    }
}

// 📌 Atualiza os filtros de nomes dinamicamente
function preencherFiltroNomes() {
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

// 📌 Atualiza a tabela aplicando filtros corretamente
function atualizarTabela() {
    console.log("🔄 Atualizando tabela com filtros...");

    const tabela = document.getElementById("tabela-admin");
    if (!tabela) {
        console.warn("⚠️ Tabela de administradores não encontrada!");
        return;
    }

    const filtroNome = document.getElementById("filtro-nome")?.value || "";
    const filtroAdmin = document.getElementById("filtro-admin")?.textContent.trim() || "Todos";
    const filtroVerificado = document.getElementById("filtro-verificado")?.textContent.trim() || "Todos";

    let adminsFiltrados = adminsData.filter(admin => {
        return (
            (filtroNome === "" || admin.nome === filtroNome) &&
            (filtroAdmin === "Todos" || (filtroAdmin === "✅ Sim" && admin.is_admin) || (filtroAdmin === "❌ Não" && !admin.is_admin)) &&
            (filtroVerificado === "Todos" || (filtroVerificado === "✅ Sim" && admin.is_verified) || (filtroVerificado === "❌ Não" && !admin.is_verified))
        );
    });

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
            <td>
                <button class="btn btn-admin" onclick="alterarAdmin(${admin.id}, ${admin.is_admin})">
                    ${admin.is_admin ? "🔽 Remover Admin" : "🔼 Tornar Admin"}
                </button>
                <button class="btn btn-remove" onclick="removerUsuario(${admin.id})">🗑 Remover</button>
            </td>
        `;
        tabela.appendChild(row);
    });

    console.log("✅ Tabela atualizada com filtros aplicados!");
}

// 📌 Exibir detalhes diretamente do array de dados (agora atualizado com os filtros)
function exibirDetalhes(id) {
    const dentista = adminsData.find(admin => admin.id === id);
    if (!dentista) {
        console.error(`❌ Dentista ID ${id} não encontrado nos dados.`);
        return;
    }

    document.getElementById("dentista-nome").textContent = dentista.nome;
    document.getElementById("dentista-email").textContent = dentista.email || "Não informado";
    document.getElementById("dentista-telefone").textContent = dentista.telefone || "Não informado";
    document.getElementById("dentista-total-pedidos").textContent = dentista.total_pedidos ?? "0";
    document.getElementById("dentista-pedidos-abertos").textContent = dentista.pedidos_abertos ?? "0";
    document.getElementById("dentista-admin").textContent = dentista.is_admin ? "✅ Sim" : "❌ Não";
    document.getElementById("dentista-credenciado").textContent = dentista.is_verified ? "✅ Sim" : "❌ Não";

    document.getElementById("detalhes-dentista").style.display = "block";
    document.querySelector(".modificar-credenciais").style.display = "block";

    document.getElementById("toggle-admin").onclick = () => alterarAdmin(dentista.id, dentista.is_admin);
    document.getElementById("toggle-credenciado").onclick = () => alterarCredenciado(dentista.id, dentista.is_verified);

    document.getElementById("marcador-detalhes").scrollIntoView({ behavior: "smooth", block: "start" });

    console.log(`✅ Detalhes do dentista ID ${id} exibidos!`);
}

// 📌 Monitorar mudanças no DOM para ativar os filtros dinamicamente
const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
            if (document.getElementById("filtro-nome")) {
                console.log("✅ Filtros detectados, aplicando eventos...");
                aplicarEventosFiltros();
                observer.disconnect(); // Para de observar após encontrar os filtros
            }
        }
    }
});

// 📌 Observar mudanças na estrutura do painel
observer.observe(document.body, { childList: true, subtree: true });

function aplicarEventosFiltros() {
    document.getElementById("filtro-admin")?.addEventListener("click", function () {
        toggleFilter(this);
        atualizarTabela();
    });

    document.getElementById("filtro-verificado")?.addEventListener("click", function () {
        toggleFilter(this);
        atualizarTabela();
    });

    document.getElementById("filtro-nome")?.addEventListener("change", atualizarTabela);
}

// 📌 Função para alternar os filtros "Admin" e "Verificado"
function toggleFilter(btn) {
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

// 🔥 Chama a função ao carregar a página
carregarAdmins();


/**


console.log("[Admin] 🔥 Script tabela_admin.js carregado corretamente!");

async function carregarAdmins() {
    console.log("[Admin] 🔄 Iniciando carregamento dos administradores...");

    try {
        // ✅ Obtém o token do localStorage
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

        const admins = await apiResponse.json();
        console.log("✅ Administradores recebidos:", admins);

        const tabela = document.getElementById("tabela-admin");
        if (!tabela) {
            console.error("❌ Elemento #tabela-admin não encontrado! Verifique o HTML.");
            return;
        }

        // ✅ Limpa a tabela antes de inserir os novos registros
        tabela.innerHTML = "";

        admins.forEach(admin => {
            console.log(`📌 Adicionando admin ID ${admin.id}...`);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${admin.id}</td>
                <td>${admin.nome} (ID: ${admin.id})</td>
                <td>
                    <button class="btn btn-detalhes" onclick="exibirDetalhes(${admin.id}, '${admin.nome}', ${admin.is_admin}, ${admin.is_verified}, ${admin.total_pedidos}, ${admin.pedidos_abertos})">
                        📄 Ver Detalhes
                    </button>
                </td>
                <td>${admin.is_admin ? "✅ Sim" : "❌ Não"}</td>
                <td>${admin.is_verified ? "✅ Sim" : "❌ Não"}</td>
                <td>${admin.total_pedidos}</td>
                <td>${admin.pedidos_abertos}</td>
                <td>
                    <button class="btn btn-admin" onclick="alterarAdmin(${admin.id}, ${admin.is_admin})">
                        ${admin.is_admin ? "🔽 Remover Admin" : "🔼 Tornar Admin"}
                    </button>
                    <button class="btn btn-remove" onclick="removerUsuario(${admin.id})">🗑 Remover</button>
                </td>
            `;
            tabela.appendChild(row);
        });

        console.log("✅ Tabela preenchida com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao carregar administradores:", error);
        document.getElementById("tabela-admin").innerHTML = `<tr><td colspan="8" style="color: red;">Erro ao carregar administradores.</td></tr>`;
    }
}

// 🔥 Função para exibir os detalhes do dentista selecionado
// 🔥 Função para exibir os detalhes do dentista selecionado e rolar a página
async function exibirDetalhes(id) {
    console.log(`🆕 Buscando detalhes do dentista ID ${id}...`);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Usuário não autenticado! Redirecionando para login.");
            window.location.href = "/login.html";
            return;
        }

        const response = await fetch(`http://localhost:5000/admin/dentistas/${id}`, {
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

        // Atualiza os campos no HTML
        document.getElementById("dentista-nome").textContent = dentista.nome;
        document.getElementById("dentista-email").textContent = dentista.email || "Não informado";
        document.getElementById("dentista-telefone").textContent = dentista.telefone || "Não informado";
        document.getElementById("dentista-total-pedidos").textContent = dentista.total_pedidos ?? "0";
        document.getElementById("dentista-pedidos-abertos").textContent = dentista.pedidos_abertos ?? "0";
        document.getElementById("dentista-admin").textContent = dentista.is_admin ? "✅ Sim" : "❌ Não";
        document.getElementById("dentista-credenciado").textContent = dentista.is_verified ? "✅ Sim" : "❌ Não";

        // Exibe a seção de detalhes e controles de modificação
        document.getElementById("detalhes-dentista").style.display = "block";
        document.querySelector(".modificar-credenciais").style.display = "block";

        // Atualiza os botões de ação para modificar admin/credenciado
        document.getElementById("toggle-admin").onclick = () => alterarAdmin(dentista.id, dentista.is_admin);
        document.getElementById("toggle-credenciado").onclick = () => alterarCredenciado(dentista.id, dentista.is_verified);


        // 🔥 Atualiza o <select> garantindo que o nome completo esteja correto
        const select = document.getElementById("dentista-select");
        if (select) {
            let option = select.querySelector(`option[value="${dentista.id}"]`);

            if (!option) {
                // Caso o dentista ainda não esteja no <select>, adiciona
                option = document.createElement("option");
                option.value = dentista.id;
                select.appendChild(option);
            }

            // Define o nome completo no <select>
            option.textContent = ` ${dentista.id} - ${dentista.nome} -`;
            select.value = dentista.id; // Seleciona automaticamente o dentista atual
        }

        console.log("✅ Select atualizado com o dentista selecionado.");

        // Rola para os detalhes se necessário
        const marcadorDetalhes = document.getElementById("marcador-detalhes");
        if (marcadorDetalhes) {
            marcadorDetalhes.scrollIntoView({ behavior: "smooth", block: "start" });
        }

    } catch (error) {
        console.error("❌ Erro ao carregar detalhes do dentista:", error);
    }
}


// 🔥 Chama a função ao carregar a página
carregarAdmins();


**/