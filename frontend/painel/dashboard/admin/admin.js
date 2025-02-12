const pedidosContainer = document.getElementById("pedidos-container");
const tabelaContainer = document.getElementById("tabela-container");
const detalhesContainer = document.getElementById("detalhes-container");
const estatisticasContainer = document.getElementById("estatisticas-container");

// 🔥 Função para carregar módulos dinamicamente
async function carregarModulo(container, htmlPath, cssPath, scriptPath, nome, callback) {
    console.log(`📂 Carregando módulo: ${nome}`);

    try {
        // 🔥 Carrega o HTML do módulo
        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error(`Módulo ${nome} não encontrado!`);

        const moduloHtml = await response.text();
        container.innerHTML = moduloHtml;
        console.log(`✅ HTML do módulo ${nome} carregado!`);

        // 🔥 Carrega o CSS do módulo (se ainda não estiver carregado)
        if (!document.querySelector(`link[href='${cssPath}']`)) {
            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = cssPath;
            document.head.appendChild(css);
            console.log(`🎨 CSS do módulo ${nome} carregado!`);
        }

        // 🔥 Remove qualquer script antigo do mesmo módulo (para evitar duplicação)
        const existingScript = document.querySelector(`script[src='${scriptPath}']`);
        if (existingScript) {
            existingScript.remove();
            console.log(`🗑 Script antigo do módulo ${nome} removido.`);
        }

        // 🔥 Carrega o JS do módulo DINAMICAMENTE e executa o callback após o carregamento
        const script = document.createElement("script");
        script.src = scriptPath;
        script.defer = true;

        script.onload = () => {
            console.log(`✅ JS do módulo ${nome} carregado!`);
            if (typeof callback === "function") {
                console.log(`🚀 Executando callback para ${nome}...`);
                callback();  // ✅ Aqui garantimos que os eventos são reatribuídos!
            }
        };

        script.onerror = () => console.error(`❌ Erro ao carregar ${scriptPath}!`);

        document.body.appendChild(script);

    } catch (error) {
        console.error(`❌ Erro ao carregar ${nome}:`, error);
        container.innerHTML = `<p style="color: red;">Erro ao carregar ${nome}.</p>`;
    }
}


carregarModulo(
    detalhesContainer, 
    "dashboard/admin/modules/detalhes_admin.html", 
    "dashboard/admin/modules/detalhes_admin.css", 
    "dashboard/admin/modules/detalhes_admin.js", 
    "detalhes_admin",
    () => {
        console.log("🚀 Inicializando funcionalidades de detalhes...");
        carregarDentistasParaSelecao(); // 🔥 Carrega a lista de dentistas no <select>

        // ✅ Garante que o botão "Carregar Detalhes" seja vinculado corretamente
        const botaoCarregar = document.getElementById("carregar-detalhes");
        if (botaoCarregar) {
            botaoCarregar.addEventListener("click", carregarDetalhesDentista);
            console.log("✅ Evento de clique vinculado ao botão 'Carregar Detalhes'");
        } else {
            console.error("❌ Botão 'Carregar Detalhes' não encontrado!");
        }
    }
);

// 🔥 Carregando os módulos dinamicamente
carregarModulo(
    estatisticasContainer, 
    "dashboard/admin/modules/estatisticas_admin.html", 
    "dashboard/admin/modules/estatisticas_admin.css", 
    "dashboard/admin/modules/estatisticas_admin.js", 
    "estatisticas_admin",
    () => {
        console.log("🚀 Inicializando funcionalidades de estatísticas...");
        carregarEstatisticas(); // Chamar a função correta para estatísticas
    }
);

carregarModulo(
    tabelaContainer, 
    "dashboard/admin/modules/tabela_admin.html", 
    "dashboard/admin/modules/tabela_admin.css", 
    "dashboard/admin/modules/tabela_admin.js", 
    "tabela_admin",
    () => {
        console.log("🚀 Inicializando funcionalidades da tabela...");
        carregarTabelaAdmins(); // Chamar a função correta para carregar a tabela
    }
);

carregarModulo(
    pedidosContainer, 
    "dashboard/admin/modules/pedidos_admin.html", 
    "dashboard/admin/modules/pedidos_admin.css", 
    "dashboard/admin/modules/pedidos_admin.js", 
    "pedidos_admin",
    () => {
        console.log("🚀 Inicializando funcionalidades de pedidos...");
        carregarPedidos(); // Chamar a função correta para carregar os pedidos
    }
);
