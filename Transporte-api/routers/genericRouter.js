import { Router } from 'express';
import { createController } from '../controllers/genericController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Tu validador de tokens

export const configureGenericRouter = (tableName, primaryKeyName) => {
  const router = Router();
  const controller = createController(tableName, primaryKeyName);

  // Aplicar el middleware de autenticación a TODO este enrutador
  router.use(authMiddleware);

  // Ruta raíz de la tabla (Ej: /api/vehiculos)
  router.route('/')
    .get(controller.getAll)           // PROTEGIDO: Ahora requiere Token JWT
    .post(controller.create);         // PROTEGIDO: Requiere Token JWT

  // Ruta con ID de la tabla (Ej: /api/vehiculos/5)
  router.route('/:id')
    .get(controller.getById)          // PROTEGIDO: Ahora requiere Token JWT
    .put(controller.update)           // PROTEGIDO: Requiere Token JWT
    .delete(controller.delete);       // PROTEGIDO: Requiere Token JWT

  return router;
};