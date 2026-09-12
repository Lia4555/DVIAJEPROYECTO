import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { schemas } from '../schemas/genericSchema.js';

// Aviso temprano si falta el secreto del JWT (evita tokens firmados con "undefined")
if (!process.env.JWT_SECRET) {
  console.error(' Falta JWT_SECRET en el archivo .env. Defínelo antes de usar auth.');
}

// ============================================================
// 1. REGISTRO
// ============================================================
export const register = async (req, res, next) => {
  try {
    // Validación fuerte con Zod: email válido, contraseña mínima (6),
    // nombres mínimos, id_rol entero. Además, Zod elimina campos extra.
    const datos = schemas.usuario.parse(req.body);

    // 🔒 SEGURIDAD (evita escalada de privilegios):
    // En el registro público NO se permite que el usuario elija su rol.
    // Siempre se asigna el rol 'Cliente' (nivel 1). Para crear Administradores
    // o Conductores, hazlo desde Supabase o desde una ruta protegida de admin.
    let idRolFinal = datos.id_rol;
    const { data: rolCliente } = await supabase
      .from('roles')
      .select('id_rol')
      .eq('nombre_rol', 'Cliente')
      .maybeSingle();
    if (rolCliente) idRolFinal = rolCliente.id_rol;
    // --- Si en DESARROLLO quieres permitir elegir el rol, comenta las 6
    //     líneas anteriores (desde "let idRolFinal") y usa: const idRolFinal = datos.id_rol;

    // Encriptar contraseña (coste 12; mayor = más seguro y algo más lento)
    const hashedPassword = await bcrypt.hash(datos.contrasena, 12);

    // Guardar en Supabase (nunca se guarda la contraseña en texto plano)
    const { error } = await supabase
      .from('usuario')
      .insert([{
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        contrasena: hashedPassword,
        telefono: datos.telefono || null,
        id_rol: idRolFinal
      }]);

    if (error) {
      // 23505 = violación de clave única (correo repetido) en Postgres
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ese correo ya está registrado.' });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado con éxito. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    next(error); // el errorHandler formatea los errores de Zod y de la BD
  }
};

// ============================================================
// 2. LOGIN
// ============================================================
export const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscar el usuario por correo
    const { data: usuario, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('correo', correo)
      .single();

    // Mensaje genérico a propósito: no revela si falló el correo o la clave
    if (error || !usuario) {
      return res.status(401).json({ error: 'El correo o la contraseña son incorrectos.' });
    }

    // Comparar la contraseña contra el hash guardado
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'El correo o la contraseña son incorrectos.' });
    }

    // Traer el nivel de permiso del rol (para autorización por rol en las rutas)
    const { data: rol } = await supabase
      .from('roles')
      .select('nombre_rol, nivel_permiso')
      .eq('id_rol', usuario.id_rol)
      .maybeSingle();

    const nivelPermiso = rol?.nivel_permiso ?? 1;
    const nombreRol = rol?.nombre_rol ?? null;

    // Firmar el token: incluye el nivel de permiso para poder proteger rutas por rol
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        nivel_permiso: nivelPermiso,
        rol: nombreRol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: '¡Login exitoso!',
      token,
      user: {
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        rol: nombreRol
      }
    });
  } catch (error) {
    next(error);
  }
};