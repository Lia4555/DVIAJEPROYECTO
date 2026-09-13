import { supabase } from '../config/supabase.js';
import { schemas } from '../schemas/genericSchema.js';
import { limpiarCacheVehiculos } from '../middleware/permisos.js';

// Tablas cuyo contenido cambia que vehiculos ve cada conductor.
const AFECTAN_ALCANCE = new Set(['vehiculos', 'servicios']);

// ¿La fila cae dentro de lo que este usuario tiene permitido ver?
// req.alcance lo deja el middleware de permisos: para el administrador
// no existe, asi que esta funcion siempre dice que si.
const dentroDelAlcance = (alcance, fila) => {
  if (!alcance) return true;
  if (!fila) return false;
  return alcance.valores.map(String).includes(String(fila[alcance.columna]));
};

export const createController = (tableName, primaryKeyName) => {
  return {

    // 1. POST (Crear) - reservado al administrador por el router
    create: async (req, res, next) => {
      try {
        const schema = schemas[tableName];
        // Zod valida Y elimina campos no definidos (protege contra "mass assignment":
        // que alguien intente colar columnas extra en el insert).
        if (schema) {
          req.body = schema.parse(req.body);
        }

        const { data, error } = await supabase
          .from(tableName)
          .insert([req.body])
          .select();

        if (error) throw error;
        if (AFECTAN_ALCANCE.has(tableName)) limpiarCacheVehiculos();

        return res.status(201).json({
          success: true,
          message: `Registro creado en ${tableName}`,
          data: data && data.length > 0 ? data[0] : req.body
        });
      } catch (error) {
        next(error);
      }
    },

    // 2. GET ALL (Listar)
    // Un conductor recibe SOLO sus filas: el recorte se hace en la consulta,
    // no en el navegador, para que los datos ajenos nunca salgan del servidor.
    getAll: async (req, res, next) => {
      try {
        let consulta = supabase.from(tableName).select('*');

        if (req.alcance) {
          // Sin nada asignado todavia: lista vacia, no la tabla completa.
          if (req.alcance.valores.length === 0) return res.status(200).json([]);
          consulta = consulta.in(req.alcance.columna, req.alcance.valores);
        }

        const { data, error } = await consulta;
        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    },

    // 3. GET BY ID (Buscar uno)
    getById: async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq(primaryKeyName, id)
          .maybeSingle(); // no lanza error si no encuentra nada

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Registro no encontrado' });

        // Fuera de su alcance: se responde 404, no 403, para no revelar
        // que el registro existe.
        if (!dentroDelAlcance(req.alcance, data)) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }

        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    },

    // 4. PUT (Actualizar)
    update: async (req, res, next) => {
      try {
        const { id } = req.params;

        // Antes de tocar nada: si el usuario tiene alcance limitado hay que
        // comprobar que la fila es suya.
        if (req.alcance) {
          const { data: actual, error: errorLectura } = await supabase
            .from(tableName)
            .select('*')
            .eq(primaryKeyName, id)
            .maybeSingle();

          if (errorLectura) throw errorLectura;
          if (!actual || !dentroDelAlcance(req.alcance, actual)) {
            return res.status(404).json({ error: 'Registro no encontrado' });
          }
        }

        // Un cambio parcial (conductor) ya viene filtrado y validado por el
        // middleware de permisos. El administrador puede mandar el registro
        // entero (panel web) o solo lo que cambia (app movil): se valida con
        // el esquema en modo parcial, que revisa cada campo enviado sin
        // exigir los demas.
        const schema = schemas[tableName];
        if (schema && !req.cambioParcial) {
          req.body = schema.partial().parse(req.body ?? {});
        }

        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: 'No enviaste ningún cambio válido.' });
        }

        const { data, error } = await supabase
          .from(tableName)
          .update(req.body)
          .eq(primaryKeyName, id)
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }

        if (AFECTAN_ALCANCE.has(tableName)) limpiarCacheVehiculos();

        return res.status(200).json({ success: true, data: data[0] });
      } catch (error) {
        next(error);
      }
    },

    // 5. DELETE (Eliminar) - reservado al administrador por el router
    delete: async (req, res, next) => {
      try {
        const { id } = req.params;
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(primaryKeyName, id);

        if (error) throw error;
        if (AFECTAN_ALCANCE.has(tableName)) limpiarCacheVehiculos();

        return res.status(200).json({ success: true, message: 'Registro eliminado exitosamente' });
      } catch (error) {
        next(error);
      }
    }
  };
};
