# Frontend Transporte (React + Vite + Axios)

Panel de administración conectado a tu backend de Express + Supabase.
Incluye **login con JWT**, **registro** y **CRUD completo** (crear, listar, editar, eliminar)
para todas tus tablas.

---

##  Requisitos
- Tener **Node.js** instalado (el mismo que usas para el backend).
- Tener tu **backend corriendo** (normalmente en `http://localhost:3000`).

##  Cómo arrancarlo (paso a paso)

1. **Abre una terminal** dentro de esta carpeta (`frontend-transporte`).

2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```

3. Arranca el frontend:
   ```bash
   npm run dev
   ```

4. Se abrirá solo en el navegador en:
   ```
   http://localhost:5173
   ```
   (Si no abre solo, copia esa dirección en tu navegador.)

5. **IMPORTANTE:** deja tu backend encendido en otra terminal:
   ```bash
   npm run dev   # (dentro de la carpeta del backend)
   ```

---

##  Primer uso

1. Como todo está protegido con token, primero necesitas un usuario.
   En la pantalla de inicio haz clic en **"Crear una cuenta"** y regístrate.
   - El campo **ID Rol** debe ser un número que **exista en tu tabla `roles`**
     (por ejemplo `1`). Si no tienes roles, crea uno primero en la BD o con Postman.
2. Inicia sesión con ese correo y contraseña.
3. Ya dentro, usa el menú de la izquierda para entrar a cualquier tabla y
   crear/editar/eliminar registros.

---

##  Cambiar la URL del backend

Si tu backend NO está en `http://localhost:3000`, edita el archivo **`.env`**:

```
VITE_API_URL=http://localhost:3000/api
```

Guarda y vuelve a ejecutar `npm run dev`.

---

##  ¿Dónde está cada cosa? (por si quieres tocar algo)

| Archivo | Para qué sirve |
|---|---|
| `src/api/api.js` | Configura Axios y mete el token JWT en cada petición |
| `src/entities.js` | **Lista de tablas y campos.** Aquí agregas/quitas campos |
| `src/helpers.js` | Convierte fechas/números antes de enviar al backend |
| `src/components/Login.jsx` | Pantalla de login |
| `src/components/Register.jsx` | Pantalla de registro |
| `src/components/Dashboard.jsx` | Menú lateral + estructura del panel |
| `src/components/DataTable.jsx` | Tabla con listar/eliminar y botones |
| `src/components/EntityForm.jsx` | Formulario para crear/editar |

###  ¿Agregar una tabla nueva?
Solo añade un objeto en `src/entities.js` con `key`, `label`, `endpoint`, `pk` y sus `fields`.
No tienes que tocar nada más: la tabla y el formulario se generan solos.

---

##  Problemas comunes

- **"Error de conexión"** → tu backend no está corriendo, o la URL en `.env` está mal.
- **"No hay token" / te saca al login** → el token venció (dura 8 h). Vuelve a iniciar sesión.
- **Errores rojos al guardar** → son las validaciones de Zod del backend; te dicen qué campo falló.
- **Error de CORS** → tu backend ya tiene `app.use(cors())`, así que no debería pasar.
  Si pasara, revisa que el backend tenga esa línea activa.
