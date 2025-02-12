const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();


const dentistasRoutes = require('./routes/dentistas');
const pacientesRoutes = require('./routes/pacientes');
const pedidosRoutes = require('./routes/pedidos');
//novas rotas
const dashboardAdminRoutes = require("./routes/dashboardAdmin");

const app = express();

// Configurações básicas
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rotas
app.use('/dentistas', dentistasRoutes);
app.use('/pacientes', pacientesRoutes);
app.use('/pedidos', pedidosRoutes);
// Rotas do Admin Dashboard
app.use("/admin", dashboardAdminRoutes);


// Inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 777 Servidor rodando na porta ${PORT}`);
});


