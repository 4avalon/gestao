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
        script.type = "module";  // ✅ Adicionando suporte a módulos
        script.defer = true;

        script.onload = () => {
            console.log(`✅ JS do módulo ${nome} carregado!`);
            if (typeof callback === "function") {
                console.log(`🚀 Executando callback para ${nome}...`);
                callback();
            }
        };

        script.onerror = () => console.error(`❌ Erro ao carregar ${scriptPath}!`);

        document.body.appendChild(script);

    } catch (error) {
        console.error(`❌ Erro ao carregar ${nome}:`, error);
        container.innerHTML = `<p style="color: red;">Erro ao carregar ${nome}.</p>`;
    }
}

// 🔥 Carregando módulos dinamicamente

// 🔥 Primeiro, carregamos os filtros da tabela
const isPainel = window.location.href.includes("painel");

const caminhoFiltros = isPainel
    ? "dashboard/admin/modules/tabela_admin_filtros.js" // Caminho no painel
    : "modules/tabela_admin_filtros.js"; // Caminho normal fora do painel

carregarModulo(
    tabelaContainer, 
    "dashboard/admin/modules/tabela_admin.html", 
    "dashboard/admin/modules/tabela_admin.css", 
    caminhoFiltros, // Agora usa o caminho correto dependendo do contexto
    "tabela_admin_filtros",
    () => {
        console.log("🚀 Filtros da tabela carregados!");
        
        carregarModulo(
            tabelaContainer, 
            "dashboard/admin/modules/tabela_admin.html", 
            "dashboard/admin/modules/tabela_admin.css", 
            "dashboard/admin/modules/tabela_admin.js", 
            "tabela_admin",
            () => {
                console.log("🚀 Inicializando funcionalidades da tabela...");

            }
        );
    }
);


// 🔥 Carregando Detalhes
carregarModulo(
    detalhesContainer, 
    "dashboard/admin/modules/detalhes_admin.html", 
    "dashboard/admin/modules/detalhes_admin.css", 
    "dashboard/admin/modules/detalhes_admin.js", 
    "detalhes_admin",
    () => {
        console.log("🚀 Inicializando funcionalidades de detalhes...");
        
        if (typeof carregarDentistasParaSelecao === "function") {
            carregarDentistasParaSelecao();
        } else {
            console.error("❌ Função carregarDentistasParaSelecao não encontrada!");
        }

        const botaoCarregar = document.getElementById("carregar-detalhes");
        if (botaoCarregar) {
            botaoCarregar.addEventListener("click", () => {
                if (typeof carregarDetalhesDentista === "function") {
                    carregarDetalhesDentista();
                } else {
                    console.error("❌ Função carregarDetalhesDentista não encontrada!");
                }
            });
            console.log("✅ Evento de clique vinculado ao botão 'Carregar Detalhes'");
        } else {
            console.error("❌ Botão 'Carregar Detalhes' não encontrado!");
        }
    }
);