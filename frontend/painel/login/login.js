console.log("[Login] Iniciando login.js...");

setTimeout(() => {
    console.log("[Login] Tentando obter os elementos do DOM...");

    const loginContainer = document.getElementById("login-container");
    const dashboardContainer = document.getElementById("dashboard-container");

    if (!loginContainer || !dashboardContainer) {
        console.error("❌ loginContainer ou dashboardContainer não encontrados!");
        return;
    }

    console.log("✅ Containers encontrados!", { loginContainer, dashboardContainer });

    const loginForm = document.getElementById("login-form");
    if (!loginForm) {
        console.error("❌ Formulário de login não encontrado!");
        return;
    }

    console.log("✅ Formulário de login encontrado!");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("📤 Evento de submit acionado!");

        const emailInput = document.getElementById("email");
        const senhaInput = document.getElementById("senha");

        if (!emailInput || !senhaInput) {
            console.error("❌ Campos de e-mail ou senha não encontrados no DOM!");
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const senha = senhaInput.value.trim();

        console.log(`🔑 Tentando login com:\n   - Email: ${email}\n   - Senha: ${senha}`);

        try {
            console.log("🌍 Enviando requisição para o servidor...");
            const response = await fetch("http://localhost:5000/dentistas/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            console.log("🔄 Resposta recebida do servidor.");
            const data = await response.json();

            console.log("📥 Resposta JSON:", data);

            if (!response.ok) {
                console.error(`❌ Erro no login: ${data.message || "Erro desconhecido"}`);
                document.getElementById("error-message").textContent = data.message;
                document.getElementById("error-message").style.display = "block";
                return;
            }

            console.log("✅ Login bem-sucedido!");
            console.log("🛠️ Salvando token no localStorage...");

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.dentista));

            console.log("🔀 Ocultando login e mostrando o dashboard...");
            loginContainer.style.display = "none";  // Esconde o login
            dashboardContainer.style.display = "block"; // Mostra o dashboard
             location.href = location.href;

        } catch (error) {
            console.error("❌ Erro ao tentar logar:", error);
            document.getElementById("error-message").textContent = "Erro ao conectar ao servidor.";
            document.getElementById("error-message").style.display = "block";
        }
    });

    console.log("📌 Event listener de submit adicionado ao formulário!");
}, 1000);
