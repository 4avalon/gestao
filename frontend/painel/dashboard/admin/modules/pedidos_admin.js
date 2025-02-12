console.log("[Pedidos Admin] 🔥 Script pedidos_admin.js carregado corretamente!");

let pedidosOriginais = []; // Armazena todos os pedidos sem filtros

async function carregarPedidos() {
    console.log("[Pedidos Admin] 🔄 Iniciando carregamento de pedidos...");

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Usuário não autenticado! Redirecionando para login.");
            window.location.href = "/login.html";
            return;
        }

        console.log("🔍 Enviando requisição para buscar pedidos...");
        const apiResponse = await fetch("http://localhost:5000/admin/pedidos/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!apiResponse.ok) {
            throw new Error(`❌ Erro ao carregar pedidos. Status: ${apiResponse.status}`);
        }

        pedidosOriginais = await apiResponse.json();
        console.log("✅ Pedidos recebidos:", pedidosOriginais);

        preencherFiltros();
        atualizarTabelaPedidos();
        
    } catch (error) {
        console.error("❌ Erro ao carregar pedidos_admin:", error);
        document.getElementById("pedidos-admin").innerHTML = `<tr><td colspan="7" style="color: red;">Erro ao carregar pedidos.</td></tr>`;
    }
}

function preencherFiltros() {
    console.log("🔽 Preenchendo filtros...");
    
    const filtroDentista = document.getElementById("filtro-dentista");
    const filtroStatus = document.getElementById("filtro-status");

    const dentistasUnicos = [...new Set(pedidosOriginais.map(p => p.dentista_nome))];
    const statusUnicos = [...new Set(pedidosOriginais.map(p => p.status))];

    dentistasUnicos.forEach(dentista => {
        const option = document.createElement("option");
        option.value = dentista;
        option.textContent = dentista;
        filtroDentista.appendChild(option);
    });

    statusUnicos.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        filtroStatus.appendChild(option);
    });

    filtroDentista.addEventListener("change", atualizarTabelaPedidos);
    filtroStatus.addEventListener("change", atualizarTabelaPedidos);
    document.getElementById("filtro-video").addEventListener("change", atualizarTabelaPedidos);
    document.getElementById("filtro-data").addEventListener("change", atualizarTabelaPedidos);
}

function atualizarTabelaPedidos() {
    console.log("🔄 Atualizando tabela com filtros...");

    const filtroDentista = document.getElementById("filtro-dentista").value;
    const filtroStatus = document.getElementById("filtro-status").value;
    const filtroVideo = document.getElementById("filtro-video").value;
    const filtroData = document.getElementById("filtro-data").value;

    const tabelaPedidos = document.getElementById("pedidos-admin");
    tabelaPedidos.innerHTML = "";

    const hoje = new Date();

    const pedidosFiltrados = pedidosOriginais.filter(pedido => {
        const dataPedido = new Date(pedido.data_pagamento);
        let passaFiltroData = true;

        if (filtroData !== "todos") {
            const dias = parseInt(filtroData);
            const dataLimite = new Date();
            dataLimite.setDate(hoje.getDate() - dias);
            passaFiltroData = dataPedido >= dataLimite;
        }

        return (
            (filtroDentista === "" || pedido.dentista_nome === filtroDentista) &&
            (filtroStatus === "" || pedido.status === filtroStatus) &&
            (filtroVideo === "" || String(pedido.video_conferencia) === filtroVideo) &&
            passaFiltroData
        );
    });

    if (pedidosFiltrados.length === 0) {
        tabelaPedidos.innerHTML = `<tr><td colspan="7" style="text-align: center; font-weight: bold;">Nenhum pedido encontrado.</td></tr>`;
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${pedido.dentista_nome}</td>
            <td>${pedido.paciente_nome}</td>
            <td>${new Date(pedido.data_pagamento).toLocaleDateString()}</td>
            <td>${pedido.status}</td>
            <td>
                <button class="btn ficha-btn" data-info='${JSON.stringify(pedido.ficha_tecnica || {})}'>
                    📄 Ver Ficha
                </button>
            </td>
            <td>
                ${pedido.arquivo_3d ? `<a href="${pedido.arquivo_3d}" target="_blank" class="btn">📁 Baixar</a>` : "❌ Sem Arquivo"}
            </td>
            <td>${pedido.video_conferencia ? "✅ Sim" : "❌ Não"}</td>
        `;
        tabelaPedidos.appendChild(row);
    });

    console.log("✅ Tabela de pedidos filtrada e atualizada!");
}

// 🔥 Carrega os pedidos ao carregar o dashboard
carregarPedidos();
