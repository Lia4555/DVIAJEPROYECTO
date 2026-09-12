import { Router } from 'express';
import { createController } from '../controllers/genericController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireNivel } from '../middleware/roles.js';

export const configureGenericRouter = (tableName, primaryKeyName) => {
  const router = Router();
  const controller = createController(tableName, primaryKeyName);

  // 1) Autenticación: todas las rutas requieren un token válido
  router.use(authMiddleware);

  // 2) Autorización por nivel de permiso (solo hay 3 roles):
  //    Administrador = 3, Conductor = 2, Cliente = 1
  //    - LEER  (GET): cualquier usuario autenticado
  //    - CREAR/EDITAR/BORRAR (POST/PUT/DELETE): solo Administrador (nivel 3)
  router.route('/')
    .get(controller.getAll)
    .post(requireNivel(3), controller.create);

  router.route('/:id')
    .get(controller.getById)
    .put(requireNivel(3), controller.update)
    .delete(requireNivel(3), controller.delete);

  return router;
};

/*
  ⚠️ IMPORTANTE antes de activar esto:
  El nivel de permiso sale del token, que a su vez sale del rol de tu usuario.
  Asegúrate de que el rol con el que INICIAS SESIÓN tenga nivel_permiso correcto.
  El script de datos deja: Administrador=3, Conductor=2, Cliente=1.

  Si tu usuario admin usa un rol que creaste a mano y quedó sin nivel_permiso,
  actualízalo en Supabase (SQL Editor) para no quedar bloqueado:

      UPDATE public.roles SET nivel_permiso = 3 WHERE nombre_rol = 'ADMIN';

  (Cambia 'ADMIN' por el nombre real de tu rol de administrador.)

  ¿Quieres que los Conductores (nivel 2) también puedan crear/editar?
  Cambia requireNivel(3) por requireNivel(2) en .post y .put (deja el DELETE en 3).

  Si por ahora prefieres NO restringir por rol (fase de desarrollo),
  deja solo estas dos líneas y borra los requireNivel(...):
      router.route('/').get(controller.getAll).post(controller.create);
      router.route('/:id').get(controller.getById).put(controller.update).delete(controller.delete);
*/