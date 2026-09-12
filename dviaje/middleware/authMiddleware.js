import jwt from 'jsonwebtoken';
import { COOKIE_NAME, clearCookieOptions } from '../config/cookies.js';

const authMiddleware = (req, res, next) => {
  // 1) Via principal: la cookie httpOnly que puso el login.
  let token = req.cookies?.[COOKIE_NAME] || null;

  // 2) Alternativa: header Authorization (util para probar con Postman/curl).
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No hay sesion activa. Inicia sesion.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    // La cookie ya no sirve: la borramos para que el navegador deje de mandarla
    // en cada peticion (si no, el usuario queda atrapado en un bucle de 401).
    res.clearCookie(COOKIE_NAME, clearCookieOptions);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesion expiro, inicia sesion de nuevo' });
    }
    return res.status(401).json({ error: 'Sesion invalida, inicia sesion de nuevo' });
  }
};

export default authMiddleware;
