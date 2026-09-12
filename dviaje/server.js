import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Se valida ANTES de importar nada que dependa del entorno, para fallar con un
// mensaje claro en vez de con un error raro a mitad de una peticion.
const requeridas = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];
const faltantes = requeridas.filter((v) => !process.env[v]);
if (faltantes.length) {
  console.error(`\n Falta configurar en el archivo .env: ${faltantes.join(', ')}\n`);
  process.exit(1);
}

// Importacion dinamica a proposito: los import estaticos se evaluan ANTES que
// dotenv.config(), asi que los modulos que leen process.env al cargarse
// (JWT_SECRET, credenciales de Supabase) los verian vacios.
const { configureGenericRouter } = await import('./routers/genericRouter.js');
const { authRouter } = await import('./routers/authRouter.js');
const { errorHandler } = await import('./middleware/errorHandler.js');
const { supabase } = await import('./config/supabase.js');
const { cookieOptions } = await import('./config/cookies.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Detras de un proxy (Render, Railway, Nginx...) Express necesita esto para
// saber que la conexion original era HTTPS y poder emitir cookies "secure".
app.set('trust proxy', 1);

// CORS con credenciales. Con cookies el origin NO puede ser '*': tiene que ser
// la lista exacta de origenes permitidos, y credentials debe ir en true.
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Sin origin = peticiones del mismo servidor o de curl/Postman: se permiten.
    if (!origin || origenesPermitidos.includes(origin)) return callback(null, true);
    const err = new Error(`Origen no permitido por CORS: ${origin}`);
    err.status = 403; // si no, el errorHandler lo trataria como un 500
    return callback(err);
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de autenticación (login, register, logout, me)
app.use('/api/auth', authRouter);

// Mapeo de tablas -> endpoints
const tablasConfig = [
  { endpoint: 'roles', tabla: 'roles', pk: 'id_rol' },
  { endpoint: 'tipos-documentos', tabla: 'tipos_documentos', pk: 'id_tipo_documento' },
  { endpoint: 'estados-servicio', tabla: 'estados_servicio', pk: 'id_estado' },
  { endpoint: 'tipos-alerta', tabla: 'tipos_alerta', pk: 'id_tipo_alerta' },
  { endpoint: 'destinos', tabla: 'destinos', pk: 'id_destino' },
  { endpoint: 'clases-viaje', tabla: 'clases_viaje', pk: 'id_clase' },
  { endpoint: 'tipos-vehiculo', tabla: 'tipos_vehiculo', pk: 'id_tipo_vehiculo' },
  { endpoint: 'conductor', tabla: 'conductor', pk: 'id_conductor' },
  { endpoint: 'clientes', tabla: 'cliente', pk: 'id_cliente' },
  { endpoint: 'vehiculos', tabla: 'vehiculos', pk: 'id_vehiculo' },
  { endpoint: 'documentos-vehiculo', tabla: 'documentos_vehiculo', pk: 'id_documento' },
  { endpoint: 'historial-conductores', tabla: 'historial_conductores', pk: 'id_historial' },
  { endpoint: 'mantenimientos', tabla: 'mantenimientos', pk: 'id_mantenimiento' },
  { endpoint: 'servicios', tabla: 'servicios', pk: 'id_servicio' },
  { endpoint: 'reservas', tabla: 'reservas', pk: 'id_reserva' },
  { endpoint: 'alertas', tabla: 'alertas', pk: 'id_alerta' }
];

tablasConfig.forEach(({ endpoint, tabla, pk }) => {
  const urlPrefijo = `/api/${endpoint}`;
  console.log(`[Ruta Registrada]: -> ${urlPrefijo}`);
  app.use(urlPrefijo, configureGenericRouter(tabla, pk));
});

app.get('/health', (req, res) => res.json({ status: 'UP', timestamp: new Date() }));

// Ruta inexistente -> 404 en JSON (no el HTML por defecto de Express)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// El manejador de errores va de ultimo: recibe todo lo que llegue por next(error)
app.use(errorHandler);

async function verificarConexionSupabase() {
  try {
    const { error } = await supabase.from('roles').select('id_rol').limit(1);
    if (error) throw error;
    console.log(' Conexion exitosa con Supabase');
  } catch (error) {
    console.error(' Error de conexion con Supabase.');
    console.error(`Detalle: ${error.message || error}`);
  }
}

app.listen(PORT, async () => {
  console.log(`\n Servidor corriendo en: http://localhost:${PORT}`);
  console.log(` Total de APIs de tablas operativas: ${tablasConfig.length}`);
  console.log(` CORS permitido para: ${origenesPermitidos.join(', ')}`);
  console.log(` Cookies: httpOnly, sameSite=${cookieOptions.sameSite}, secure=${cookieOptions.secure}`);
  await verificarConexionSupabase();
});