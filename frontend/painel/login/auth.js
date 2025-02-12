document.addEventListener("DOMContentLoaded", async () => {
    console.log("[Auth] Verificando autenticação...");

    const loginContainer = document.getElementById("login-container");
    const dashboardContainer = document.getElementById("dashboard-container");
    const header = document.getElementById("titulo");

    if (!loginContainer || !dashboardContainer || !header) {
        console.error("❌ Erro: Elementos do DOM não encontrados!");
        return;
    }

    // 🔥 Verifica se o usuário está logado pelo token no localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
        console.log("✅ Usuário autenticado:", user);

        // Define o caminho do dashboard e do script correspondente
        const dashboardPath = user.is_admin ? "dashboard/admin/admin.html" : "dashboard/dentista/dentista.html";
        const scriptPath = user.is_admin ? "dashboard/admin/admin.js" : "dashboard/dentista/dentista.js";

        console.log(`📂 Carregando dashboard: ${dashboardPath}`);

        try {
            const response = await fetch(dashboardPath);
            if (!response.ok) throw new Error("Dashboard não encontrado!");

            const dashboardHtml = await response.text();
            dashboardContainer.innerHTML = dashboardHtml;

            // 🔥 Carrega dinamicamente o JS do dashboard
            const dashboardScript = document.createElement("script");
            dashboardScript.src = scriptPath;
            dashboardScript.onload = () => console.log(`✅ [Auth] ${scriptPath} carregado!`);
            document.body.appendChild(dashboardScript);
            
        } catch (error) {
            console.error("❌ Erro ao carregar o dashboard:", error);
            dashboardContainer.innerHTML = `<p style="color: red;">Erro ao carregar o dashboard.</p>`;
        }

        // 🔥 Atualiza o header com os dados do usuário
        header.innerHTML = `
            <span>${user.is_admin ? "👑 ADMIN" : "🦷 DENTISTA"} - Sr. ${user.nome} (ID: ${user.id})</span>
            ${user.is_verified ? '✅ Credenciado' : '❌ Não Credenciado'}
            <button id="logout-button">Logout</button>
        `;

        // Esconde login e mostra dashboard
        loginContainer.style.display = "none";
        dashboardContainer.style.display = "block";

        // 🔹 Logout (quando o usuário clica em "Sair")
        document.getElementById("logout-button").addEventListener("click", () => {
            console.log("🚪 Logout realizado!");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            location.href = location.href; // 🔄 Recarrega a página
        });

    } else {
        console.warn("⚠️ Nenhum usuário logado.");

        // Mostra o login e esconde o dashboard
        loginContainer.style.display = "block";
        dashboardContainer.style.display = "none";
    }
});
