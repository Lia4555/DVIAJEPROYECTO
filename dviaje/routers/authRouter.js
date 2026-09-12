import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

export const authRouter = Router();

// No hay ruta de registro: las cuentas (Administrador o Conductor) las crea
// el administrador. Ver controllers/authController.js.
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', authMiddleware, me);
