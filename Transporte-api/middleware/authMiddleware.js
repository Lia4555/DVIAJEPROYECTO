import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: "No hay token" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Formato inválido" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: "Token inválido" });
    }
};

export default authMiddleware;