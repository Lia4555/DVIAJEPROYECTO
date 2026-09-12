# AppMovil — Transporte (MVVM)

App móvil Android del proyecto de transporte. Se conecta al backend de este
mismo repositorio (`server.js`, puerto 3000) y está pensada para el rol
**Conductor** (un Administrador también puede entrar, en modo lectura).

Sin librerías raras: **Expo + React Native + TypeScript**. La navegación es
propia (`src/Presentation/hooks/useNavegacion.ts`), no hay React Navigation ni
Redux. La única dependencia añadida al proyecto base es
`@react-native-async-storage/async-storage`, para no pedir la contraseña cada
vez que se abre la app.

---

## 1. Arquitectura MVVM

```
src/
├── Domain/                MODELO (el negocio, sin React ni HTTP)
│   ├── entities/          Usuario, Servicio, Vehiculo, Alerta, Catalogo
│   ├── repositories/      contratos (interfaces) que el dominio exige
│   └── useCases/          acciones con sus reglas: IniciarSesion, etc.
│
├── Data/                  implementa los contratos del dominio
│   ├── config/ApiConfig   ← dirección del servidor (se edita aquí)
│   ├── api/HttpClient     fetch + token + timeout + errores
│   ├── local/             sesión guardada en el teléfono
│   ├── sources/           llamadas crudas a /api/...
│   ├── repositories/      *RepositoryImpl
│   └── di/Container       arma todo y expone `casosDeUso`
│
└── Presentation/
    ├── views/             VISTA: solo pinta y recoge eventos
    ├── components/        piezas reutilizables (botón, tarjeta, badge...)
    ├── hooks/             VIEWMODEL: estado + acciones de cada pantalla
    └── theme/             colores, espaciados, tipografía y formatos
```

**Regla que se cumple en todo el código:** una vista nunca llama a la API.
Llama a su ViewModel → el ViewModel llama a un caso de uso → el caso de uso
trabaja contra un contrato del dominio → la capa Data decide si eso es HTTP,
caché o almacenamiento local.

| Capa MVVM | Dónde está |
|---|---|
| **Model** | `src/Domain` + `src/Data` |
| **View** | `src/Presentation/views` y `components` |
| **ViewModel** | `src/Presentation/hooks/use*ViewModel.ts` |

---

## 2. Pantallas

| Pantalla | Archivo | Qué hace |
|---|---|---|
| Login | `views/LoginView.tsx` | Entra con el correo asignado por el admin |
| Servicios | `views/ServiciosView.tsx` | Viajes asignados, con filtros y "deslizar para actualizar" |
| Detalle | `views/ServicioDetalleView.tsx` | Cambia el estado del viaje y registra la llegada real |
| Vehículo | `views/VehiculoView.tsx` | Ficha, documentos (avisa si vencen) y mantenimientos |
| Alertas | `views/AlertasView.tsx` | Avisos ordenados por prioridad |
| Perfil | `views/PerfilView.tsx` | Datos de la cuenta y cerrar sesión |

Los permisos reales los aplica el servidor (`middleware/permisos.js`): un
conductor solo recibe sus servicios y su vehículo, aunque pida la lista
completa.

---

## 3. Cómo ejecutarla en Android Studio

### Requisitos
- Android Studio instalado (ya trae el JDK y el SDK).
- Un emulador creado en Android Studio (*Device Manager → Create device*), o un
  teléfono con **Depuración USB** activada.

### Paso 1 — Levantar el backend
```bash
cd ..
npm install
npm run dev        # queda en http://localhost:3000
```

### Paso 2 — Revisar la dirección del servidor
Se configura en **`src/Data/config/ApiConfig.ts`**:

- **Emulador de Android Studio:** ya viene listo (`10.0.2.2:3000`). Esa IP es
  como el emulador ve el `localhost` del computador; `127.0.0.1` sería el
  propio teléfono virtual.
- **Teléfono físico:** cambia `IP_EN_RED_LOCAL` por la IP del computador
  (`ipconfig` → *Dirección IPv4*, algo como `192.168.1.15`) y usa
  `baseUrlDispositivoFisico`. El teléfono y el PC deben estar en la misma wifi.

### Paso 3 — Generar el proyecto nativo y ejecutar
```bash
npm install
npm run android      # genera android/ si falta, compila e instala la app
```

Para abrirlo **dentro de Android Studio**: *File → Open* y selecciona la
carpeta **`AppMovil/android`**. Espera a que Gradle sincronice y dale al botón
verde ▶ con el emulador arrancado.

> La carpeta `android/` la genera Expo (`npm run prebuild`). Si algo se rompe,
> `npm run android:limpiar` la regenera desde cero a partir de `app.json`.

---

## 4. Notas técnicas

- **Sesión:** el backend guarda el token en una cookie httpOnly, que en una app
  nativa no existe. Por eso `login` devuelve también el token en el JSON
  **solo** cuando el cliente manda la cabecera `X-Client: mobile`
  (`controllers/authController.js`). La app lo guarda cifrado en el
  almacenamiento del teléfono y lo envía como `Authorization: Bearer ...`, que
  el servidor ya aceptaba.
- **HTTP en claro:** Android 9+ bloquea `http://` por defecto; `app.json` activa
  `usesCleartextTraffic` para poder hablar con el servidor local. En producción
  se pone la URL con HTTPS y se quita esa línea.
- **Errores:** todo pasa por `HttpClient`, que corta a los 15 s y traduce el
  fallo a un mensaje en pantalla con botón de reintentar.
