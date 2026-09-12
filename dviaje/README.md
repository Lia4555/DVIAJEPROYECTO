# D' VIAJE — Sistema de Transporte

Backend Express + Supabase con autenticación por **cookie httpOnly**, y frontend React (Vite).

## Cómo se ejecuta

Se necesitan **dos terminales**, una para cada parte.

**Terminal 1 — Backend** (desde la raíz del proyecto):

```bash
npm install      # solo la primera vez
npm run dev      # http://localhost:3000
```

**Terminal 2 — Frontend**:

```bash
cd frontend-transporte
npm install      # solo la primera vez
npm run dev      # http://localhost:5173
```

## Configuración (.env)

Copia `.env.example` a `.env` y rellena los valores. Los datos de Supabase salen de
**Project Settings → API** en el panel de Supabase:

- `SUPABASE_URL`: la URL completa, `https://<ref>.supabase.co`
- `SUPABASE_KEY`: la clave **anon public** (un JWT largo que empieza por `eyJ`), *no* la contraseña de la base de datos

Si falta alguna variable obligatoria, el servidor no arranca y dice cuál falta.

---

## Los dos roles

El sistema tiene **exactamente dos roles**. No hay más, y no se pueden crear desde
la interfaz.

| Rol | Nivel | Qué puede hacer |
|---|---|---|
| **Administrador** | 3 | Todo: gestiona flota, servicios, conductores, clientes, reservas y alertas. |
| **Conductor** | 2 | Solo lo suyo: ver los servicios que le asignó el administrador, cambiar su estado, y consultar y reportar el vehículo que conduce. |

### Qué puede tocar exactamente un conductor

La regla vive en [`middleware/permisos.js`](middleware/permisos.js), en el **servidor**.
El frontend solo esconde botones; quien mande la petición a mano igualmente choca
con esta capa.

| Recurso | Conductor |
|---|---|
| `servicios` | Ve **solo los suyos**. Puede cambiar `id_estado`, `fecha_llegada_real` y `observaciones`. |
| `vehiculos` | Ve **solo los que conduce**. Puede cambiar `estado_operativo` y las dos fechas de mantenimiento. |
| `documentos-vehiculo`, `mantenimientos` | Solo lectura, y solo de sus vehículos. |
| `alertas` | Solo lectura, y solo las dirigidas a él. |
| `conductor` | Solo su propia ficha. |
| Catálogos (estados, destinos, tipos) | Solo lectura, para que la pantalla muestre nombres en vez de códigos. |
| `clientes`, `reservas`, `roles`, `clases-viaje`, `historial-conductores` | **403.** No los ve. |
| Crear (`POST`) y eliminar (`DELETE`) en cualquier tabla | **403.** Solo el administrador. |

### No hay registro público

Las dos cuentas son cuentas de trabajo, así que las crea el administrador.
Si el registro estuviera abierto, cualquiera con el enlace se haría una cuenta
de conductor. El endpoint `POST /api/auth/register` **ya no existe**.

### Cómo se une un conductor con su ficha

Son dos tablas distintas:

- **`usuario`** → con lo que se inicia sesión (`correo` + `contrasena`)
- **`conductor`** → la ficha a la que se le asignan los servicios (`email`)

El backend las une **por correo**: `usuario.correo = conductor.email`. Los dos
tienen que ser idénticos. Si un conductor inicia sesión y no tiene ficha con ese
correo, el login se lo dice con un mensaje claro en vez de dejarle un panel vacío.

---

## Poner la base de datos en dos roles

En el **SQL Editor** de Supabase, en este orden:

1. [`sql/roles-2-niveles.sql`](sql/roles-2-niveles.sql) — deja solo Administrador
   y Conductor, une los duplicados y fija los niveles. Va dentro de una
   transacción: si algo no cuadra, no aplica nada y te dice qué falta.
2. [`sql/crear-cuentas-conductores.sql`](sql/crear-cuentas-conductores.sql) — crea
   la cuenta de acceso de cada ficha de conductor que no la tenga, con una
   contraseña temporal (`Conductor2026*`).

El primer script se detiene si quedan usuarios con el antiguo rol *Cliente*: en su
PASO 4 eliges si convertirlos en conductores o borrarlos.

---

## Cómo funciona la autenticación con cookies

1. `POST /api/auth/login` valida el correo y la contraseña (bcrypt), firma un JWT
   y lo guarda en una cookie **httpOnly**. El token nunca viaja en el JSON de la
   respuesta ni se guarda en `localStorage`, así que el JavaScript de la página no
   puede leerlo: eso es lo que protege la sesión frente a ataques XSS.
2. El navegador manda esa cookie sola en cada petición siguiente. El frontend solo
   necesita `withCredentials: true` en axios (ya está en `src/api/api.js`).
3. `authMiddleware` lee la cookie, verifica el JWT y deja el usuario en `req.user`.
   Si el token está vencido o alterado, responde 401 **y borra la cookie**, para que
   el navegador no siga mandando una cookie muerta.
4. `POST /api/auth/logout` borra la cookie con exactamente los mismos atributos con
   los que se creó (requisito del navegador para que el borrado surta efecto).
5. Al abrir o recargar la página, el frontend llama a `GET /api/auth/me`: como la
   cookie es httpOnly, es la única forma de saber si la sesión sigue viva.

Todos los atributos de la cookie salen de un único archivo, `config/cookies.js`, para
que login y logout no puedan quedar desincronizados.

### Local vs. producción

| Escenario | Configuración |
|---|---|
| Local (`localhost:5173` → `localhost:3000`) | `CROSS_SITE_COOKIES=false` → `SameSite=Lax`. Funciona sin HTTPS: puertos distintos siguen siendo el mismo *site*. |
| Frontend y backend en dominios distintos | `CROSS_SITE_COOKIES=true` → `SameSite=None; Secure`. **Exige HTTPS en los dos lados**, si no el navegador descarta la cookie. |

Con cookies, el CORS no puede ser `*`: `FRONTEND_URL` debe listar el origen exacto
(o varios separados por coma) y `credentials` va en `true`.

---

## Estructura

```
server.js                  Arranque, CORS, registro de las 16 rutas
config/cookies.js          Atributos de la cookie de sesión (fuente única)
config/supabase.js         Cliente de Supabase
controllers/               authController (login/logout/me) + genericController (CRUD)
middleware/                authMiddleware, permisos, errorHandler
routers/                   authRouter + genericRouter
schemas/                   Validación con Zod de cada tabla
sql/                       Scripts de migración de roles y cuentas
frontend-transporte/       Cliente React (Vite)
_legacy/                   Código antiguo archivado, ya no se usa
```

`_legacy/` guarda el backend duplicado que había antes (`Transporte-api/`) y los
controladores viejos que usaban tablas en PascalCase y token por header. No se
ejecutan; se pueden borrar cuando quieras.
