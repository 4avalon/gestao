
        console.log("[Estatísticas Admin] 🔥 Script estatisticas_admin.js carregado corretamente!");

        async function carregarEstatisticas() {
            console.log("[Estatísticas Admin] 🔄 Iniciando carregamento das estatísticas...");

            try {
                // ✅ Obtém o token do localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("❌ Usuário não autenticado! Redirecionando para login.");
                    window.location.href = "/login.html";
                    return;
                }

                console.log("🔍 Enviando requisição para buscar estatísticas...");
                const apiResponse = await fetch("http://localhost:5000/admin/estatisticas", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!apiResponse.ok) {
                    throw new Error(`❌ Erro ao carregar estatísticas. Status: ${apiResponse.status}`);
                }

                const estatisticas = await apiResponse.json();
                console.log("✅ Estatísticas recebidas:", estatisticas);

                // ✅ Confirma que os elementos existem antes de tentar manipular
                function atualizarElemento(id, valor) {
                    const elemento = document.getElementById(id);
                    if (elemento) {
                        console.log(`📝 Atualizando #${id} -> ${valor}`);
                        elemento.textContent = valor || 0;
                    } else {
                        console.warn(`⚠️ Elemento #${id} não encontrado! Verifique o HTML.`);
                    }
                }

                // ✅ Atualiza os valores no HTML com verificação
                atualizarElemento("dentistas", estatisticas.total_dentistas);
                atualizarElemento("pacientes", estatisticas.total_pacientes);
                atualizarElemento("pedidosTotais", estatisticas.total_pedidos);
                atualizarElemento("pedidosAbertos", estatisticas.pedidos_abertos);
                atualizarElemento("pedidosConcluidos", estatisticas.pedidos_concluidos);
                atualizarElemento("pedidosCancelados", estatisticas.pedidos_cancelados);
                atualizarElemento("dentistasCred", estatisticas.dentistas_credenciados);
                atualizarElemento("pedidosSemana", estatisticas.pedidos_ultimos7dias);

                console.log("✅ Estatísticas atualizadas no HTML com sucesso!");

            } catch (error) {
                console.error("❌ Erro ao carregar estatisticas_admin:", error);
            }
        }

        // 🔥 Chama a função ao carregar o dashboard
        carregarEstatisticas();