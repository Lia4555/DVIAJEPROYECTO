import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { ROL, limpiarCacheVehiculos } from '../middleware/permisos.js';

// ============================================================
// CUENTAS DE ACCESO
// ------------------------------------------------------------
// 1. Registro publico  -> crea la cuenta APAGADA (activo = false).
// 2. Login             -> rechaza las cuentas apagadas (authController).
// 3. Administrador     -> lista, aprueba, desactiva o rechaza cuentas.
//
// Quien se registra siempre queda como Conductor: un administrador solo
// se crea con "npm run crear-admin". Asi, el enlace publico no puede dar
// acceso a nada hasta que un administrador lo apruebe.
// ============================================================

export const TIPOS_DOCUMENTO = ['CC', 'CE', 'PA'];

const texto = (min, max, campo) =>
  z
    .string({ required_error: `${campo} es obligatorio.` })
    .trim()
    .min(min, `${campo} debe tener al menos ${min} caracteres.`)
    .max(max, `${campo} admite como máximo ${max} caracteres.`);

// Mismos nombres de campo que el formulario: el frontend pinta cada error
// debajo de su input.
const esquemaRegistro = z.object({
  nombre: texto(2, 60, 'El nombre'),
  apellido: texto(2, 60, 'El apellido'),
  tipo_documento: z.enum(TIPOS_DOCUMENTO, {
    errorMap: () => ({ message: 'Elige un tipo de documento válido.' })
  }),
  numero_documento: z
    .string({ required_error: 'El número de documento es obligatorio.' })
    .trim()
    .regex(/^[A-Za-z0-9]{5,20}$/, 'El documento debe tener entre 5 y 20 letras o números, sin puntos ni espacios.'),
  telefono: z
    .string({ required_error: 'El teléfono es obligatorio.' })
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/, 'Escribe un teléfono válido (solo números, mínimo 7).'),
  correo: z
    .string({ required_error: 'El correo es obligatorio.' })
    .trim()
    .max(120, 'El correo es demasiado largo.')
    .email('El correo no tiene un formato válido.'),
  // bcrypt solo usa los primeros 72 bytes: mas largo daria una falsa sensacion de seguridad.
  contrasena: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña admite como máximo 72 caracteres.')
});

const conflicto = (res, campo, mensaje) =>
  res.status(409).json({ error: mensaje, detalles: [{ campo, mensaje }] });

async function idRolConductor() {
  const { data, error } = await supabase
    .from('roles')
    .select('id_rol')
    .eq('nombre_rol', ROL.CONDUCTOR)
    .order('id_rol')
    .limit(1);
  if (error) throw error;
  return data?.[0]?.id_rol ?? null;
}

// ------------------------------------------------------------------
// POST /api/auth/register  (publico)
// ------------------------------------------------------------------
export const registrar = async (req, res, next) => {
  try {
    const datos = esquemaRegistro.parse(req.body ?? {});

    // El correo no puede existir ni como cuenta ni como ficha de conductor,
    // y el documento no puede repetirse entre fichas.
    const [cuenta, fichaCorreo, fichaDocumento] = await Promise.all([
      supabase.from('usuario').select('id_usuario').eq('correo', datos.correo).limit(1),
      supabase.from('conductor').select('id_conductor').eq('email', datos.correo).limit(1),
      supabase
        .from('conductor')
        .select('id_conductor')
        .eq('numero_documento', datos.numero_documento)
        .limit(1)
    ]);
    for (const r of [cuenta, fichaCorreo, fichaDocumento]) if (r.error) throw r.error;

    if (cuenta.data.length || fichaCorreo.data.length) {
      return conflicto(res, 'correo', 'Ya existe una cuenta o una solicitud con ese correo.');
    }
    if (fichaDocumento.data.length) {
      return conflicto(res, 'numero_documento', 'Ya hay un conductor registrado con ese documento.');
    }

    const idRol = await idRolConductor();
    if (!idRol) {
      const err = new Error('El sistema no tiene configurado el rol Conductor.');
      err.status = 500;
      throw err;
    }

    // 1) Ficha de conductor, apagada hasta la aprobacion.
    const { data: ficha, error: errorFicha } = await supabase
      .from('conductor')
      .insert([
        {
          nombre: datos.nombre,
          apellido: datos.apellido,
          tipo_documento: datos.tipo_documento,
          numero_documento: datos.numero_documento,
          email: datos.correo,
          telefono: datos.telefono,
          id_rol: idRol,
          activo: false
        }
      ])
      .select('id_conductor')
      .single();
    if (errorFicha) throw errorFicha;

    // 2) Cuenta de acceso, tambien apagada. Si falla, se deshace la ficha
    //    para no dejar datos a medias (Supabase no ofrece transacciones
    //    desde el cliente).
    const hash = await bcrypt.hash(datos.contrasena, 10);
    const { error: errorCuenta } = await supabase.from('usuario').insert([
      {
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        contrasena: hash,
        telefono: datos.telefono,
        activo: false,
        id_rol: idRol
      }
    ]);

    if (errorCuenta) {
      await supabase.from('conductor').delete().eq('id_conductor', ficha.id_conductor);
      throw errorCuenta;
    }

    return res.status(201).json({
      message:
        'Solicitud enviada. Un administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.'
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// Rutas del administrador (/api/cuentas)
// ------------------------------------------------------------------
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ------------------------------------------------------------------
// Estado de una cuenta: pendiente, activa o desactivada
// ------------------------------------------------------------------
// "activo" solo dice si puede entrar. Para saber si una cuenta apagada es
// una solicitud sin revisar o una cuenta desactivada hace falta la columna
// usuario.aprobada_en (sql/estado-cuentas.sql). Mientras no se ejecute ese
// script, todo lo apagado se sigue tratando como pendiente.
let columnaAprobacion = { existe: null, revisarDespuesDe: 0 };

async function hayColumnaAprobacion() {
  if (columnaAprobacion.existe === true) return true;
  if (columnaAprobacion.existe === false && Date.now() < columnaAprobacion.revisarDespuesDe) return false;

  const { error } = await supabase.from('usuario').select('aprobada_en').limit(1);
  if (error && (error.code === '42703' || /aprobada_en/.test(error.message || ''))) {
    // Se vuelve a mirar cada minuto: asi basta con ejecutar el SQL, sin reiniciar.
    columnaAprobacion = { existe: false, revisarDespuesDe: Date.now() + 60000 };
    return false;
  }
  if (error) throw error;
  columnaAprobacion = { existe: true, revisarDespuesDe: 0 };
  return true;
}

export const estadoCuenta = (cuenta) => {
  if (cuenta.activo) return 'activa';
  return cuenta.aprobada_en ? 'desactivada' : 'pendiente';
};

async function buscarCuenta(id) {
  const columnas = `id_usuario, correo, activo, id_rol${(await hayColumnaAprobacion()) ? ', aprobada_en' : ''}`;
  const { data, error } = await supabase
    .from('usuario')
    .select(columnas)
    .eq('id_usuario', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function nombreRol(idRol) {
  const { data, error } = await supabase
    .from('roles')
    .select('nombre_rol')
    .eq('id_rol', idRol)
    .maybeSingle();
  if (error) throw error;
  return data?.nombre_rol ?? null;
}

const noEncontrada = (res) => res.status(404).json({ error: 'Cuenta no encontrada.' });

// GET /api/cuentas  — nunca se devuelve la columna "contrasena".
export const listar = async (req, res, next) => {
  try {
    const conAprobacion = await hayColumnaAprobacion();
    const [cuentas, roles, fichas] = await Promise.all([
      supabase
        .from('usuario')
        .select(
          `id_usuario, nombre, apellido, correo, telefono, activo, id_rol, fecha_registro${conAprobacion ? ', aprobada_en' : ''}`
        )
        .order('fecha_registro', { ascending: false }),
      supabase.from('roles').select('id_rol, nombre_rol'),
      supabase.from('conductor').select('id_conductor, email, tipo_documento, numero_documento')
    ]);
    for (const r of [cuentas, roles, fichas]) if (r.error) throw r.error;

    const rolPorId = new Map(roles.data.map((r) => [r.id_rol, r.nombre_rol]));
    const fichaPorCorreo = new Map(fichas.data.map((f) => [f.email, f]));

    return res.json(
      cuentas.data.map((c) => {
        const ficha = fichaPorCorreo.get(c.correo);
        const rol = rolPorId.get(c.id_rol) ?? null;
        return {
          ...c,
          // Un administrador nunca viene del registro publico: apagado, esta desactivado.
          estado: !c.activo && rol === ROL.ADMIN ? 'desactivada' : estadoCuenta(c),
          rol,
          tiene_ficha: Boolean(ficha),
          tipo_documento: ficha?.tipo_documento ?? null,
          numero_documento: ficha?.numero_documento ?? null,
          es_tu_cuenta: c.id_usuario === req.user.id_usuario
        };
      })
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/cuentas/:id/aprobar
export const aprobar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!RE_UUID.test(id)) return noEncontrada(res);

    const cuenta = await buscarCuenta(id);
    if (!cuenta) return noEncontrada(res);
    if (cuenta.activo) return res.status(400).json({ error: 'Esta cuenta ya está activa.' });

    const eraDesactivada = Boolean(cuenta.aprobada_en);
    const cambios = { activo: true };
    // La primera aprobacion queda registrada; reactivar no la cambia.
    if ((await hayColumnaAprobacion()) && !cuenta.aprobada_en) {
      cambios.aprobada_en = new Date().toISOString();
    }

    const { error } = await supabase.from('usuario').update(cambios).eq('id_usuario', id);
    if (error) throw error;

    // La ficha del conductor (si la hay) se enciende con la cuenta.
    const { error: errorFicha } = await supabase
      .from('conductor')
      .update({ activo: true })
      .eq('email', cuenta.correo);
    if (errorFicha) throw errorFicha;

    limpiarCacheVehiculos();
    return res.json({
      success: true,
      message: eraDesactivada ? `Cuenta ${cuenta.correo} reactivada.` : `Cuenta ${cuenta.correo} aprobada.`
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/cuentas/:id/desactivar
export const desactivar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!RE_UUID.test(id)) return noEncontrada(res);
    if (id === req.user.id_usuario) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta.' });
    }

    const cuenta = await buscarCuenta(id);
    if (!cuenta) return noEncontrada(res);
    if (!cuenta.activo) return res.status(400).json({ error: 'Esta cuenta ya no está activa.' });

    // Nunca puede quedar el sistema sin ningun administrador que pueda entrar.
    if ((await nombreRol(cuenta.id_rol)) === ROL.ADMIN) {
      const { count, error: errorConteo } = await supabase
        .from('usuario')
        .select('id_usuario', { count: 'exact', head: true })
        .eq('id_rol', cuenta.id_rol)
        .eq('activo', true);
      if (errorConteo) throw errorConteo;
      if ((count ?? 0) <= 1) {
        return res.status(400).json({ error: 'No puedes desactivar al último administrador activo.' });
      }
    }

    const cambios = { activo: false };
    // Una cuenta activa sin fecha de aprobacion (anterior a la columna) se
    // marca como aprobada: asi aparece como Desactivada y no como Pendiente.
    if ((await hayColumnaAprobacion()) && !cuenta.aprobada_en) {
      cambios.aprobada_en = new Date().toISOString();
    }

    const { error } = await supabase.from('usuario').update(cambios).eq('id_usuario', id);
    if (error) throw error;

    await supabase.from('conductor').update({ activo: false }).eq('email', cuenta.correo);

    return res.json({ success: true, message: `Cuenta ${cuenta.correo} desactivada.` });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cuentas/:id  — rechaza una solicitud (solo cuentas pendientes).
export const rechazar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!RE_UUID.test(id)) return noEncontrada(res);
    if (id === req.user.id_usuario) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    }

    const cuenta = await buscarCuenta(id);
    if (!cuenta) return noEncontrada(res);
    if (cuenta.activo) {
      return res.status(400).json({ error: 'Solo se pueden rechazar solicitudes pendientes.' });
    }

    // Una cuenta desactivada ya estuvo en uso: rechazarla borraria una cuenta
    // real. Tampoco un administrador, que nunca viene del registro publico.
    const rol = await nombreRol(cuenta.id_rol);
    if (cuenta.aprobada_en || rol === ROL.ADMIN) {
      return res.status(400).json({
        error: 'Esta cuenta ya había sido aprobada: no es una solicitud. Puedes reactivarla o dejarla desactivada.'
      });
    }

    const { error } = await supabase.from('usuario').delete().eq('id_usuario', id);
    if (error) throw error;

    // La ficha se borra solo si es de un conductor sin historial: si ya tiene
    // servicios o vehiculos asignados, se conserva (y queda apagada).
    let fichaEliminada = false;
    if (rol === ROL.CONDUCTOR) {
      const { data: ficha } = await supabase
        .from('conductor')
        .select('id_conductor')
        .eq('email', cuenta.correo)
        .maybeSingle();

      if (ficha) {
        const [servicios, vehiculos] = await Promise.all([
          supabase.from('servicios').select('id_servicio').eq('id_conductor', ficha.id_conductor).limit(1),
          supabase.from('vehiculos').select('id_vehiculo').eq('id_conductor_asignado', ficha.id_conductor).limit(1)
        ]);
        if (!servicios.data?.length && !vehiculos.data?.length) {
          const { error: errorFicha } = await supabase
            .from('conductor')
            .delete()
            .eq('id_conductor', ficha.id_conductor);
          fichaEliminada = !errorFicha;
        }
      }
    }

    return res.json({
      success: true,
      message: fichaEliminada
        ? `Solicitud de ${cuenta.correo} rechazada y eliminada.`
        : `Solicitud de ${cuenta.correo} rechazada. Su ficha de conductor se conservó porque tiene historial.`
    });
  } catch (error) {
    next(error);
  }
};
