const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 Middleware para autenticar qualquer usuário logado
const autenticarToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "Acesso negado. Token ausente." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido." });
    }
};

// 🔹 Middleware para verificar se o usuário é ADMIN
const autenticarAdmin = (req, res, next) => {
    if (!req.usuario || !req.usuario.is_admin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem realizar esta ação." });
    }
    next();
};

// 🔹 Middleware para verificar se o usuário é um dentista autenticado
const autenticarDentista = (req, res, next) => {
    if (!req.usuario) {
        return res.status(403).json({ message: "Acesso negado. Apenas dentistas autenticados podem realizar esta ação." });
    }
    next();
};

module.exports = { autenticarToken, autenticarAdmin, autenticarDentista };
