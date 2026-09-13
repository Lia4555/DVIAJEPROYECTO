# Cambios en la app móvil: la interfaz del frontend web llevada al teléfono

Este documento recoge **todos** los cambios hechos en `AppMovil/` para que la app se vea y
se recorra igual que el frontend web (`frontend-transporte/`), y para arreglar el inicio de
sesión, que no funcionaba.

Solo cambió la capa de **Presentación**, además de dos archivos de otras capas que
explican por qué fallaba el login (sección 2). Los ViewModels (`hooks/`), los repositorios
y los casos de uso de datos no se tocaron.

---

## Índice

1. [Dependencias nuevas](#1-dependencias-nuevas)
2. [Arreglo del inicio de sesión](#2-arreglo-del-inicio-de-sesión)
3. [Tema: colores, formas y tipografía del web](#3-tema-colores-formas-y-tipografía-del-web)
4. [Componentes compartidos](#4-componentes-compartidos)
5. [Contenido de la empresa](#5-contenido-de-la-empresa)
6. [Pantalla de arranque](#6-pantalla-de-arranque)
7. [Página principal (portada)](#7-página-principal-portada)
8. [Pantalla de inicio de sesión](#8-pantalla-de-inicio-de-sesión)
9. [Navegación y vista raíz](#9-navegación-y-vista-raíz)
10. [Panel: Mis servicios](#10-panel-mis-servicios)
11. [Panel: Detalle del servicio](#11-panel-detalle-del-servicio)
12. [Panel: Mi vehículo](#12-panel-mi-vehículo)
13. [Panel: Mis alertas](#13-panel-mis-alertas)
14. [Panel: Mi perfil](#14-panel-mi-perfil)
15. [Configuración de la app (`App.tsx` y `app.json`)](#15-configuración-de-la-app-apptsx-y-appjson)
16. [Imágenes](#16-imágenes)
17. [Verificación realizada](#17-verificación-realizada)
18. [Pendientes conocidos](#18-pendientes-conocidos)

---

## 1. Dependencias nuevas

Se instalaron con `npx expo install`, que elige las versiones compatibles con Expo SDK 57:

| Paquete | Versión | Para qué se usa |
|---|---|---|
| `react-native-svg` | 15.15.4 | Dibujar los mismos iconos de línea del web y los degradados de fondo. |
| `react-native-safe-area-context` | ~5.7.0 | Respetar la muesca, la barra de estado y la barra de gestos del teléfono. |
| `expo-constants` | ~57.0.18 | Leer la IP del computador que ejecuta Expo (ver sección 2). |

> Son módulos **nativos**. Expo Go ya los trae. Si se usa la compilación propia
> (`npm run android`), hay que **recompilar** la app una vez; recargar el JavaScript no basta.

---

## 2. Arreglo del inicio de sesión

Había dos causas por las que no se podía entrar.

### 2.1 Dirección del servidor — `src/Data/config/ApiConfig.ts`

**Antes:** la app llamaba siempre a `10.0.2.2:3000` en Android (así llama el *emulador* al
computador) o a `localhost:3000` en iOS. Desde un **teléfono real** ninguna de las dos
apunta al computador, así que la petición nunca llegaba. Existía una IP fija
(`192.168.1.10`) en `baseUrlDispositivoFisico`, pero nada la usaba.

**Ahora** la dirección se decide sola, en este orden:

1. `EXPO_PUBLIC_API_URL`, si está definida (por ejemplo en un `.env` de `AppMovil`):
   `EXPO_PUBLIC_API_URL=http://192.168.1.15:3000/api`
2. La IP del computador que ejecuta Expo, tomada de `Constants.expoConfig.hostUri`. Es la
   misma IP desde la que el teléfono descarga la app, así que sirve igual por wifi y en el
   emulador. Si esa IP es `localhost` dentro del emulador de Android, se cambia por `10.0.2.2`.
3. Si no hay nada de lo anterior: `10.0.2.2` en Android y `localhost` en iOS.

Se eliminaron `IP_EN_RED_LOCAL` y `baseUrlDispositivoFisico`.

### 2.2 Validación del login — `src/Domain/useCases/auth/IniciarSesion.ts`

**Antes:** el caso de uso pasaba el correo a minúsculas y rechazaba contraseñas de menos de
6 caracteres. El backend compara el correo **tal cual está guardado**, así que una cuenta
guardada con mayúsculas, o con una contraseña corta, no podía entrar nunca.

**Ahora** aplica las mismas reglas que el login web: correo y contraseña obligatorios, y
formato de correo válido. Nada más.

---

## 3. Tema: colores, formas y tipografía del web

Carpeta `src/Presentation/theme/`. La app pasó de un tema oscuro azul a la marca de D' VIAJE,
con los mismos valores que `frontend-transporte/src/index.css`.

### 3.1 `colors.ts` (reescrito)

- Paleta con los nombres del web:
  - **Marca:** `rojo #d81e24`, `rojoHover`, `rojoSuave`, `vino #7a1113`, `vino2`, `vino3`, `salmon`.
  - **Estados:** `verde`, `ambar`, `azul`, `error` y sus variantes suaves.
  - **Neutros:** `tinta`, `texto`, `muted`, `muted2`, `linea`, `linea2`, `fondoInput`, `papel`, `blanco`.
- **`TONOS`:** pares fondo/texto para las pastillas de estado (`programado`, `curso`,
  `hecho`, `cancelado`, `neutro`), idénticos a `.estado.*` del web.
- **`tonoEstado(nombre)`** reemplaza a `colorEstado`. Reconoce el estado por palabras clave
  sin importar tildes ("En tránsito" → curso, "Finalizado" → hecho…), igual que
  `claseEstado` en `MisServicios.jsx`.

### 3.2 `spacing.ts`

- `radius` con los radios del web: `xs 8`, `sm 10`, `md 14`, `lg 20`, `full`.
- `sombras` nuevo: `s1`, `s2`, `s3` y `rojo`, equivalentes a `--sombra-1/2/3` (en Android
  se aplican con `elevation`).
- `spacing.xl` pasa de 24 a 20.

### 3.3 `typography.ts`

- Títulos en peso 800 y color `tinta`, como en el web.
- Estilos nuevos:
  - `lead`: párrafo destacado en gris.
  - `eyebrow`: antetítulo en mayúsculas y rojo.
  - `rotulo`: el `<dt>` de las fichas, del tipo "SALIDA".
  - `valor`: el `<dd>` de las fichas.

---

## 4. Componentes compartidos

Carpeta `src/Presentation/components/`.

| Componente | Estado | Qué hace / qué cambió |
|---|---|---|
| `Icono.tsx` | **Nuevo** | Los iconos de `Icons.jsx` del web (ruta, bus, campana, escudo, ojo, etc.) dibujados con SVG. Uso: `<Icono nombre="bus" tamano={20} color={...} />`. |
| `Degradado.tsx` | **Nuevo** | Fondo con degradado lineal y brillos radiales, para replicar los `linear-gradient` + `radial-gradient` del CSS. |
| `Marca.tsx` | **Nuevo** | Círculo rojo "DV" + "D' VIAJE" + eslogan, en versión clara u oscura. También exporta `SelloMarca` (solo el círculo). |
| `Dato.tsx` | **Nuevo** | `Dato`: par rótulo/valor. `RejillaDatos`: los ordena en dos columnas. |
| `BarraSuperior.tsx` | **Nuevo** | Cabecera color vino del panel (`.cond-topbar`): marca, botón a la portada y avatar con iniciales que abre el perfil. |
| `AppButton.tsx` | Reescrito | Variantes `primario` (rojo), `ghost` (blanco con borde), `peligro` y `translucido`. Admite icono y tamaño `pequeno`. Cambia de color al presionar y tiene atributos de accesibilidad. |
| `AppInput.tsx` | Reescrito | Campo blanco con borde rojo al enfocar, borde rojo y mensaje debajo si hay `error`, y texto de `ayuda`. Si es contraseña, trae botón para mostrarla u ocultarla. Admite `ref`, tecla de retorno y envío con el teclado. |
| `AppCard.tsx` | Reescrito | Tarjeta blanca con borde, radio 14 y sombra suave. Al presionarla, el borde se pone salmón. |
| `Badge.tsx` | Reescrito | Pastilla con fondo de color y punto delante (`.estado`). Recibe `tono` en vez de `color`. |
| `MensajeEstado.tsx` | Reescrito | `Cargando` con rueda roja. `AvisoError` con el estilo de `.alert.error`, icono y enlace "Reintentar". `AvisoExito` es nuevo. `SinDatos` ahora es una caja punteada con icono, admite botón de acción y variante `positivo` (círculo verde). |
| `Pantalla.tsx` | Reescrito | Encabezado de sección (`.cond-head`): título grande y subtítulo sobre fondo `papel`. Admite `arriba`, por ejemplo para el enlace "volver". La barra de estado ya no la maneja aquí. |
| `BarraNavegacion.tsx` | Reescrito | Pestañas inferiores con iconos SVG en vez de texto ("RUTA", "BUS"…). La activa se marca en rojo con una línea arriba, y Alertas lleva un contador rojo. Respeta la barra de gestos. |
| `index.ts` | Actualizado | Exporta los componentes nuevos. |

---

## 5. Contenido de la empresa

**Nuevo:** `src/Presentation/contenido/empresa.ts`.

Tiene los mismos datos y textos de `Landing.jsx`: `EMPRESA` (nombre, dirección, teléfonos,
correo, horario), `CIFRAS`, `SERVICIOS`, `GARANTIAS`, `FLOTA` (con sus fotos), `IMAGENES` y
`ENLACES`. Si la empresa cambia un dato, hay que cambiarlo aquí **y** en el web.

---

## 6. Pantalla de arranque

**Nuevo:** `src/Presentation/views/ArranqueView.tsx`.

Reemplaza la rueda de carga sobre fondo oscuro. Muestra el sello "DV", el texto
"Comprobando tu sesión…" y una barra roja animada, igual que `.arranque` del web. Se ve
mientras se revisa si hay una sesión guardada.

---

## 7. Página principal (portada)

**Nuevo:** `src/Presentation/views/InicioView.tsx`.

Es la portada del web adaptada a una sola columna. Secciones, en orden:

1. **Barra superior fija:**
   - Marca a la izquierda. El eslogan se oculta en pantallas de menos de 400 px.
   - Botón rojo **Ingresar** y botón de menú.
   - El menú despliega La empresa, Servicios, Flota y Contacto; al tocar uno, la página se
     desplaza a esa sección.
   - La barra gana sombra al bajar, como en el web.
   - El menú se dibuja como capa encima de la página (con velo oscuro) y no dentro de la
     barra, porque en Android un toque fuera de los límites del padre no llega a sus hijos.
2. **Hero:**
   - Fondo con degradado rosado y la foto de la van con la tarjeta flotante "98,6 %".
     La sombra de la foto va en un marco aparte y no sobre la `Image`: en Android,
     `elevation` sobre una imagen con bordes redondeados pintaba un recuadro gris borroso
     y la foto no se veía. Se detectó al probar en el emulador; lo mismo se aplicó a la foto
     de "La empresa".
   - Antetítulo, titular con "seguridad, puntualidad" en rojo y párrafo.
   - Botones "Solicitar una cotización" (baja a Contacto) y "Ver servicios".
   - Tres ventajas con icono.
3. **Cifras:** 12 años, 45 vehículos, 30 mil viajes, 15 ciudades, en rejilla de 2×2.
4. **La empresa:** foto, "Quiénes somos", dos párrafos y las tarjetas Misión y Visión.
5. **Servicios:** fondo gris claro y seis tarjetas con icono en recuadro rojo suave.
6. **Flota:** **carrusel horizontal** que se ajusta tarjeta a tarjeta, con puntos
   indicadores (en el web era una rejilla).
7. **Garantías:** banda oscura con degradado vino y cuatro tarjetas translúcidas con icono
   en círculo rojo.
8. **Contacto:**
   - Dirección, teléfonos, correo y horario. Los teléfonos abren el marcador y el correo
     abre la app de correo.
   - Formulario de cotización con los mismos campos del web. El servicio se elige con
     pastillas en vez de lista desplegable.
   - Nombre y teléfono son obligatorios, con mensaje de error.
   - "Enviar solicitud" abre la app de correo con asunto y cuerpo ya escritos, igual que el
     web. Si no hay app de correo, avisa.
9. **Cierre:** "¿Eres cliente o parte del equipo?" con botón para ingresar.
10. **Pie:** fondo tinta, marca, datos de contacto, enlaces a secciones y créditos de las fotos.

Con la sesión abierta, la misma portada muestra **"Ir a mi panel"** en lugar de "Ingresar".

---

## 8. Pantalla de inicio de sesión

**Reescrito:** `src/Presentation/views/LoginView.tsx`.

Es la pantalla `AuthLayout` + `Login.jsx` del web, puesta en vertical:

- **Arriba, panel de marca color vino con degradado:**
  - Botón "Volver a la página principal".
  - Marca y frase "Gestiona tu flota, tus viajes y tus reservas desde un solo panel."
  - Las tres ventajas con punto rojo.
- **Encima, tarjeta blanca:**
  - Título "Iniciar sesión" y subtítulo "Entra con la cuenta de trabajo que te entregó la
    empresa."
  - Campo **Correo** con teclado de correo; la tecla "siguiente" salta a la contraseña.
  - Campo **Contraseña** con botón de ojo y tecla "ir" para entrar.
  - Cada campo se valida con mensaje debajo, y el error se borra al escribir.
  - Aviso rojo con el error que devuelve el servidor.
  - Botón **Entrar** ("Entrando…" mientras espera) y el texto "¿No tienes acceso? Solicítalo
    al administrador de la flota."

La lógica sigue en `useSesion`. La vista recibe `onVolver` para regresar a la portada.

---

## 9. Navegación y vista raíz

**Reescrito:** `src/Presentation/views/PrincipalView.tsx`. **Actualizado:** `views/index.ts`.

El recorrido ahora es el mismo del web:

```
Arranque ──► sin sesión ──► Portada ──(Ingresar)──► Login ──(Entrar)──► Panel
                              ▲                        │
                              └────(Volver)────────────┘

Panel ──(icono casa)──► Portada ("Ir a mi panel") ──► Panel
Panel ──(Cerrar sesión)──► Portada
```

- Al entrar o salir se limpia la pantalla pública. **Después de cerrar sesión se vuelve a la
  portada**, no al formulario.
- **Botón "atrás" de Android:**
  - En el login → vuelve a la portada.
  - En la portada con sesión → vuelve al panel.
  - En el detalle de un servicio → vuelve a la lista.
  - En Vehículo, Alertas o Perfil → vuelve a Servicios.
  - En Servicios → comportamiento normal del sistema (sale de la app).
- El panel tiene ahora la `BarraSuperior` vino. El subtítulo dice "Panel del conductor" o
  "Consulta del administrador", y las iniciales salen del nombre y apellido.

---

## 10. Panel: Mis servicios

**Reescrito:** `src/Presentation/views/ServiciosView.tsx`.

Cada viaje usa la ficha `.serv-card` del web:

- **Ficha de cada viaje:**
  - Código del servicio y pastilla de estado con su color.
  - Bloque de **ruta** sobre fondo gris: Salida (lugar y hora), flecha roja hacia abajo y
    Llegada estimada.
  - Rejilla con Pasajeros, Tipo y Llegada real.
  - Pastilla ámbar "Fuera de horario" si va con retraso.
  - Observaciones en bloque rosado con borde salmón.
  - Botón **"Actualizar estado"** (conductor) o **"Ver detalle"** (administrador).
- **Filtros** Todos / Pendientes / Retrasados con pastillas; la activa va en vino.
- **Contador** "N de M servicios · X pendientes · Y retrasados".
- **Lista vacía,** con dos mensajes distintos:
  - Si hay un filtro puesto: "Ningún servicio coincide" y botón "Quitar filtro".
  - Si no hay nada asignado: "Todavía no tienes servicios asignados" y botón "Comprobar de
    nuevo".
- Deslizar hacia abajo para actualizar, con indicador rojo.

---

## 11. Panel: Detalle del servicio

**Reescrito:** `src/Presentation/views/ServicioDetalleView.tsx`.

- Enlace rojo **"‹ Mis servicios"** encima del título, en lugar del botón gris "Volver".
- Tarjeta con estado, bloque de ruta y rejilla con Llegada real, Pasajeros, Valor, Distancia
  y Peajes.
- **Cambio de estado (antes y ahora):**
  - **Antes:** había un botón por cada estado que guardaba al instante, y *todos* mostraban
    la rueda de carga a la vez.
  - **Ahora:** los estados se muestran como **opciones de selección** (radio, con el punto
    de color de cada estado), con el campo Observaciones debajo. Un único botón
    **"Guardar: <estado>"** confirma el cambio y queda desactivado mientras no se elija
    nada. Así se evitan cambios por un toque accidental.
- Aviso verde al guardar y aviso rojo si falla.
- El administrador sigue viendo el servicio en solo lectura.

---

## 12. Panel: Mi vehículo

**Reescrito:** `src/Presentation/views/VehiculoView.tsx`.

- **Ficha `.veh-card`:**
  - Icono de bus en recuadro rosado, placa grande y "marca · línea · modelo".
  - Pastilla "Operativo" (verde) o "Fuera de servicio" (roja).
  - Rejilla con Capacidad, N.º interno, Color, Último mantenimiento y Próximo mantenimiento.
  - Botón "Reportar fuera de servicio" o "Marcar como operativo".
- **Bloque Documentos:** icono de documento, filas separadas por línea y pastilla de
  vigencia: "Vigente" (verde), "Vence en N d" (ámbar, a 30 días o menos) o "Vencido" (roja).
- **Bloque Mantenimientos recientes:** icono de herramienta, fecha y taller, y ahora
  también el **costo** a la derecha.
- Estado vacío con icono de bus: "Sin vehículo asignado".

---

## 13. Panel: Mis alertas

**Reescrito:** `src/Presentation/views/AlertasView.tsx`.

- **Tarjeta `.alerta-card`:**
  - Borde izquierdo rojo, o verde si está resuelta (entonces se ve más tenue).
  - Icono de campana en círculo rosado, o check verde si está resuelta.
  - Tipo, pastilla "Prioridad alta/media/baja" o "Resuelta", y descripción.
  - Fecha límite con icono de calendario.
- Subtítulo en lenguaje natural: "2 avisos sin resolver." o "No tienes avisos sin resolver."
- Lista vacía con círculo verde: "Todo en orden".

---

## 14. Panel: Mi perfil

**Reescrito:** `src/Presentation/views/PerfilView.tsx`.

- **Datos de la cuenta:**
  - Avatar vino con las iniciales, nombre completo y pastilla con el rol.
  - Correo y una frase que explica qué puede hacer ese rol.
- Botón **"Cerrar sesión"** con icono. Pasó a estilo `ghost`, como el botón "Salir" del web.
- **Sin datos internos.** Una primera versión mostraba el nivel de permiso, el id (UUID) de
  la ficha de conductor y un bloque "Conexión" con instrucciones técnicas. Se quitaron: a un
  conductor no le sirven, y el web tampoco enseña códigos internos.
- La dirección del servidor queda solo como una línea gris al final, **"Modo desarrollo ·
  servidor …"**, que se muestra únicamente en compilaciones de desarrollo (`__DEV__`). En la
  app compilada para producción no aparece.

> **Web, relacionado:** el botón "Volver a la página principal" del login y del registro
> (`.auth-volver`, en `AuthLayout.jsx`) no tenía ningún estilo y se veía como un botón
> gris del navegador. Se añadió en `frontend-transporte/src/index.css`: texto gris con
> flecha, y al pasar el ratón fondo rosado, texto vino y la flecha se desplaza.

---

## 15. Configuración de la app (`App.tsx` y `app.json`)

### `App.tsx`

- Se envolvió todo en `SafeAreaProvider`, que necesitan las barras superior e inferior.
- Se quitó el `StatusBar` global. Ahora cada pantalla fija el suyo: **claro** sobre las
  cabeceras vino (login y panel) y **oscuro** sobre fondos blancos (portada y arranque).

### `app.json`

| Clave | Antes | Ahora |
|---|---|---|
| `name` | `Transporte` | `D' VIAJE` |
| `userInterfaceStyle` | `dark` | `light` |
| `backgroundColor` | `#0F172A` | `#f5f6f9` (color `papel`) |
| `android.adaptiveIcon.backgroundColor` | `#0F172A` | `#7a1113` (color `vino`) |

---

## 16. Imágenes

Se copiaron desde `frontend-transporte/public/img/` a **`AppMovil/assets/img/`**:

- `hero-van.jpg`, `van-blanca.jpg`, `van-frontal.jpg`, `buseta-escolar.jpg`,
  `interior-bus.jpg` (unos 2,7 MB en total)
- `CREDITOS.md` (licencias de Wikimedia Commons; los créditos también salen en el pie de la
  portada)

---

## 17. Verificación realizada

| Prueba | Resultado |
|---|---|
| `npx tsc --noEmit` (tipos en modo estricto) | Sin errores. |
| `npx expo export --platform android` (empaquetado completo) | Correcto: 777 módulos, las 5 imágenes resueltas. |
| Backend, `GET /health` por la IP de la red local | `{"status":"UP"}` |
| Backend, `POST /api/auth/login` con un correo inexistente y `X-Client: mobile` | `401 "El correo o la contrasena son incorrectos."`: el servidor responde y consulta Supabase. |

### Recompilación y prueba en emulador

| Paso | Resultado |
|---|---|
| `npx expo run:android` en el emulador `Pixel_4` | `BUILD SUCCESSFUL in 2m 51s`: la app se instaló con los tres módulos nativos nuevos. |
| Portada en el emulador | Se ve con los colores y tipografía del web. Tras corregir la sombra del hero (sección 7), la foto aparece bien. |
| Botón **Ingresar** | Abre el login con el panel vino y la tarjeta blanca. |
| Login con un correo inexistente desde la app | Muestra el aviso rojo con el mensaje del backend ("El correo o la contrasena son incorrectos."): **la app ya llega al servidor**. |

Falta por verificar: un login con una cuenta real y las pantallas del panel con datos.

### Cómo recompilar de nuevo

```bash
# 1. Backend (desde C:\Proyectos\Backend)
npm run dev

# 2. App (desde C:\Proyectos\Backend\AppMovil), con el emulador abierto o un teléfono conectado
npm run android      # compila, instala y abre la app (solo hace falta al cambiar módulos nativos)
npx expo start --dev-client   # para cambios solo de JavaScript, sin recompilar
```

> No lanzar `npm run android` con la variable `CI=1`: en ese modo Metro no recarga los cambios.

---

## 18. Pendientes conocidos

Son cosas que **no** se cambiaron en esta tanda:

- **Firewall de Windows:** para que un teléfono real llegue al backend, el firewall debe
  permitir conexiones entrantes al puerto 3000.
- **Sesión vencida:** cuando el token de 8 horas expira, las pantallas muestran error en vez
  de volver solas al login.
- **Token sin cifrar:** la sesión se guarda en AsyncStorage sin cifrar. Lo recomendable es
  `expo-secure-store`.
- **Detalle del servicio:** sigue pidiendo la lista completa de servicios para mostrar uno
  solo, y la lista no se refresca sola al volver después de guardar.
- **`README.md` y `PASOS-FINALES.md`:** siguen describiendo el tema oscuro y la IP fija.

---

## 19. Registro de cuentas con aprobación

Se reemplazó el texto "¿No tienes acceso? Solicítalo al administrador de la flota." por la
opción de **crear una cuenta**, en la web y en la app. La cuenta nace como **Conductor
apagado** y no puede entrar hasta que un administrador la aprueba (detalle del backend en
el `README.md` de la raíz, sección «Registro con aprobación del administrador»).

### En la app

| Capa | Archivo | Cambio |
|---|---|---|
| Dominio | `Domain/entities/SolicitudCuenta.ts` | **Nuevo.** Datos de la solicitud, `TIPOS_DOCUMENTO` (CC, CE, PA) y `ErrorValidacion`, que lleva los errores por campo. |
| Dominio | `Domain/repositories/AuthRepository.ts` | Nuevo método `registrarCuenta`. |
| Dominio | `Domain/useCases/auth/RegistrarCuenta.ts` | **Nuevo.** Mismas reglas que el backend: nombre y apellido; documento de 5 a 20 letras o números; teléfono; correo; contraseña de 8 a 72 caracteres que se repite igual. |
| Datos | `Data/api/HttpClient.ts` | `ApiError` guarda los `detalles` por campo que manda el servidor. |
| Datos | `Data/sources/AuthApiSource.ts` | Nuevo `registrar()` → `POST /auth/register`. |
| Datos | `Data/repositories/AuthRepositoryImpl.ts` | Convierte los errores por campo del servidor en `ErrorValidacion`. |
| Datos | `Data/di/Container.ts` | Registra el caso de uso `registrarCuenta`. |
| Presentación | `hooks/useRegistroViewModel.ts` | **Nuevo.** Valores del formulario, errores por campo y estado "enviada". |
| Presentación | `views/RegistroView.tsx` | **Nueva pantalla** con el mismo marco del login (cabecera vino + tarjeta). Pide nombre, apellido, tipo de documento (pastillas), número de documento, teléfono, correo, contraseña y confirmación. Al enviar muestra **"Solicitud enviada"** y explica que falta la aprobación. |
| Presentación | `views/LoginView.tsx` | El pie ahora dice **"¿No tienes cuenta? Crear una cuenta"**. |
| Presentación | `views/PrincipalView.tsx` | Nueva pantalla pública `registro`. El botón atrás de Android va de registro a login y de login a portada. |

Si alguien intenta entrar con una cuenta pendiente, el login muestra el aviso del servidor:
*"Tu cuenta todavía no está activa. Un administrador debe aprobarla antes de que puedas entrar."*

### En la web (`frontend-transporte/`)

- `components/Registro.jsx` (**nuevo**): formulario de registro con la misma validación y
  pantalla de éxito.
- `components/Login.jsx`: enlace **"Crear una cuenta"**.
- `App.jsx`: nueva ruta pública `registro`.
- `components/Cuentas.jsx` (**nuevo**): sección **Personas → Cuentas de acceso** del
  administrador.
  - Filtros Pendientes / Activas / Todas.
  - Botones **Aprobar**, **Rechazar** y **Desactivar**, con confirmación.
  - Marca las cuentas de conductor que no tienen ficha.
- `components/Dashboard.jsx`: añade esa sección al menú y a las rutas (`SECCIONES_ADMIN`).
- `index.css`: estilos de los filtros y la pastilla ámbar "Pendiente".
- `demo/main.jsx`: la demo simula el registro y las cuentas.
- `tests/pruebas.jsx`: pruebas nuevas del registro, el enlace del login y la sección de
  cuentas.

### Verificación

| Prueba | Resultado |
|---|---|
| `npm test` en `frontend-transporte` | Todas las pruebas pasaron. |
| `npx vite build` | Correcto. |
| `npx tsc --noEmit` en `AppMovil` | Sin errores. |
| Prueba de punta a punta contra el backend real (18 comprobaciones) | Todas correctas: datos inválidos (400), correo repetido (409), cuenta y ficha creadas apagadas con contraseña cifrada, login pendiente (403), `/cuentas` sin sesión (401) y sin contraseñas, aprobar → login OK, desactivar → 403, rechazar borra cuenta y ficha. La cuenta de prueba se borró al terminar. |

---

## 20. Errores "Gateway Timeout" de Supabase

**Síntoma:** al abrir Vehículo o tocar "Comprobar de nuevo" en Servicios aparecía a veces
el aviso rojo **"Gateway Timeout"**.

**Causa:** el mensaje venía de **Supabase**, no de la app. Supabase responde a veces con un
504 aunque las consultas tardan entre 150 y 480 ms. Suele ser su grupo de conexiones
saturado un instante, algo habitual en el plan gratuito. El backend pasaba ese texto tal cual.

**Cambios:**

| Dónde | Cambio |
|---|---|
| `config/supabase.js` (backend) | Las **lecturas** que reciben 502, 503 o 504, o que no obtienen respuesta, se reintentan hasta 2 veces (esperas de 300 y 900 ms). Cada intento tiene un límite de 12 s. Las **escrituras nunca se repiten**, para no guardar nada dos veces. |
| `middleware/errorHandler.js` (backend) | Si aun así falla, responde 503 con *"La base de datos tardó en responder. Inténtalo de nuevo en unos segundos."* |
| `views/ServiciosView.tsx`, `views/AlertasView.tsx` | Con un error ya no se muestra además "Todavía no tienes servicios asignados" ni "Todo en orden", que eran falsos. Solo queda el aviso rojo con "Reintentar". |

**Verificación:** con un servidor falso que responde 504 a propósito:
- una lectura que falla dos veces y luego funciona termina bien;
- una lectura que sigue fallando se rinde al tercer intento;
- una escritura no se reintenta;
- el mensaje se traduce;
- una consulta real a Supabase sigue funcionando.

---

## 21. Funciones de administrador en la app

Antes, el administrador veía las pantallas del conductor en solo lectura. Ahora tiene
**su propio panel**, con pestañas **Resumen · Servicios · Cuentas · Alertas · Perfil**. El
conductor conserva su panel sin cambios.

Queda **solo en la web** lo que es trabajo de escritorio: catálogos, vehículos,
documentos, mantenimientos, clientes y reservas.

### 21.1 Pantallas nuevas (`src/Presentation/views/admin/`)

| Pantalla | Qué hace |
|---|---|
| `ResumenAdminView` | Seis mosaicos: cuentas por aprobar, servicios retrasados, en curso, que salen hoy, alertas sin resolver y vehículos fuera de servicio. Los urgentes se resaltan en color, y al tocarlos se abre la lista ya filtrada. Además: aviso ámbar con documentos vencidos o por vencer, y accesos rápidos "Nuevo servicio" y "Enviar alerta". |
| `AdminServiciosView` | Todos los servicios con conductor y placa. Filtros **Todos / Hoy / En curso / Retrasados** con contador. Marca "Fuera de horario" y "Vehículo fuera de servicio". Botón **Nuevo**. |
| `AdminServicioDetalleView` | Detalle del viaje y bloque **Despacho**: estado (pastillas), conductor y vehículo (listas con buscador) y observaciones. Avisa si el vehículo no tiene capacidad para los pasajeros. "Guardar cambios" solo se activa si algo cambió, y **manda solo lo que cambió**. Pasar a Finalizado registra la llegada real. |
| `NuevoServicioView` | Formulario completo: código (sugiere el siguiente `SVC-00NN`), tipo, origen, destino, salida y llegada (fecha `DD/MM/AAAA` y hora `HH:MM` con máscara), pasajeros, valor, conductor, vehículo, estado inicial y observaciones. Valida que la llegada sea después de la salida y que origen y destino sean distintos. |
| `CuentasView` | Solicitudes y cuentas activas, igual que «Cuentas de acceso» del web. Filtros **Pendientes / Activas / Todas**. **Aprobar**, **Rechazar** y **Desactivar**; rechazar y desactivar piden confirmación. La pestaña muestra el número de pendientes y se refresca al abrirla. |
| `AdminAlertasView` | Todas las alertas con el conductor que las recibe. Filtros **Sin resolver / Resueltas / Todas** y botón **"Marcar como resuelta"**. |
| `NuevaAlertaView` | Para quién (conductor), tipo (del catálogo), prioridad 1–5 (toma la del tipo por defecto), mensaje y fecha límite opcional. |

### 21.2 Componentes nuevos

- `Selector.tsx`: campo que abre una hoja inferior con buscador (reemplaza al `<select>`
  del web) y admite avisos como "Fuera de servicio" o "Inactivo".
- `Chips.tsx`: grupo de pastillas de elección única con contador opcional.
  - Con `desplazable`, las pastillas quedan en **una sola fila que se desliza de lado** y
    llega al borde de la pantalla.
  - Se usa en los filtros de Cuentas, Servicios y Alertas: con cuatro filtros, en un
    teléfono estrecho se partían en dos filas descuadradas.
  - Los chips de los formularios (estado, tipo, prioridad) siguen en varias filas.
  - En el resumen **no** se añadió un mosaico de cuentas desactivadas. Los mosaicos son
    para lo que requiere acción, y una desactivación es una decisión ya tomada: sigue a un
    toque en Cuentas → Desactivadas.
- `BarraNavegacion.tsx`: recibe la lista de pestañas (`PESTANAS_CONDUCTOR` o
  `PESTANAS_ADMIN`) y contadores por pestaña.

### 21.3 Lógica (dominio, datos y ViewModels)

- **Dominio**
  - `entities/Admin.ts`: `ConductorResumen`, `CuentaAcceso`, `TipoAlerta`, `NuevoServicio`,
    `NuevaAlerta`, `ResumenAdmin` y `TIPOS_SERVICIO`.
  - Casos de uso en `useCases/admin/`: `ObtenerResumenAdmin`, `ListarCuentas`,
    `GestionarCuenta`, `ListarConductores`, `CrearServicio`, `EditarServicio`, `CrearAlerta` y
    `ResolverAlerta`.
- **Datos**
  - `AdminRepository` e `AdminRepositoryImpl` (nuevos).
  - `ServicioRepository.crear`, `AlertaRepository.crear` y `resolver`.
  - `HttpClient` con `patch()` y `delete()`.
  - Los catálogos incluyen ahora los tipos de alerta.
- **ViewModels**
  - `hooks/useAdmin.ts`: resumen, flota (conductores y vehículos), cuentas, servicios y
    alertas.
  - `hooks/useFormulariosAdmin.ts`: detalle y edición, nuevo servicio y nueva alerta.
- **Navegación**
  - `useNavegacion` admite pestaña inicial, formularios a pantalla completa y filtro inicial.
  - El botón atrás de Android cierra el formulario o el detalle y luego vuelve a la pestaña
    inicial.
- **Fechas**
  - Arreglo: `formatearFecha` y `diasRestantes` mostraban un día menos las fechas sin hora
    (`2026-10-04`) por la zona horaria de Colombia.
  - Nuevas funciones de máscara y lectura de fechas en `theme/formato.ts`.

### 21.4 Backend

- `controllers/genericController.js`: el `PUT` del administrador valida **en parcial**, así
  la app puede mandar solo lo que cambia. Un `PUT` vacío responde 400.
- `schemas/genericSchema.js`: las fechas con hora aceptan zona horaria (`+00:00`), como las
  devuelve Postgres. Antes, reenviar una fecha tal cual llegaba de la base daba error 400.

### 21.5 Verificación

| Prueba | Resultado |
|---|---|
| `npx tsc --noEmit` | Sin errores. |
| Backend real, 10 comprobaciones con datos de prueba (borrados al final) | Crear servicio (201), reasignar conductor y vehículo con cambio parcial (200), finalizar con llegada real (200), reenviar fecha `+00:00` (200), cambio inválido (400), `PUT` vacío (400), crear alerta (201), resolver sin borrar los demás campos (200) y lista de cuentas (200). |
| Emulador, sesión de administrador | Resumen con datos reales (10 retrasados, 3 en curso, 10 alertas, 13 documentos vencidos), lista de Servicios con filtros y contadores, y detalle con el bloque Despacho. |

Falta probar desde la pantalla: guardar una reasignación, crear un servicio o una alerta y
aprobar una cuenta.

---

## 22. Cuentas desactivadas que aparecían como "Pendiente"

**Síntoma:** al desactivar la cuenta `antonio@gmail.com` (administrador), pasó a
**Pendientes** con los botones Aprobar y Rechazar. "Rechazar" habría borrado una cuenta que
ya estaba en uso.

**Causa:** la tabla `usuario` solo tenía `activo` (sí/no), así que una solicitud sin
revisar y una cuenta desactivada eran indistinguibles.

**Solución: tres estados**

| Estado | Significado | Acciones |
|---|---|---|
| Pendiente | Solicitud del registro sin revisar | Aprobar · Rechazar |
| Activa | Puede entrar | Desactivar |
| Desactivada | Ya estuvo aprobada y el administrador la apagó | **Reactivar** |

**Cambios:**

- **Base de datos** (`sql/estado-cuentas.sql`, **hay que ejecutarlo en Supabase**)
  - Añade `usuario.aprobada_en`, la fecha de la primera aprobación.
  - Marca como aprobadas las cuentas activas y todas las de administrador.
  - Se puede ejecutar varias veces.
- **Backend** (`controllers/cuentasController.js`)
  - Devuelve `estado` en cada cuenta.
  - Aprobar guarda `aprobada_en` y responde "reactivada" si la cuenta ya lo había estado.
  - Rechazar solo acepta solicitudes pendientes: nunca una desactivada ni un administrador.
  - **Nuevo:** no deja desactivar al último administrador activo.
  - Funciona antes y después de ejecutar el SQL: detecta la columna sola, sin reiniciar.
- **App**
  - `CuentaAcceso.estado` y filtros **Pendientes / Activas / Desactivadas / Todas**.
  - Pastilla gris "Desactivada" y botón **Reactivar**.
  - El contador de la pestaña Cuentas y el resumen solo cuentan las pendientes.
- **Web** (`Cuentas.jsx`): los mismos estados, filtros y el botón Reactivar. La demo también.

**Verificación (sin modificar datos):**
- `tsc` sin errores y `npm test` del web sin fallos.
- Contra la base real, antonio aparece como **Desactivada**.
- El servidor rechaza con 400:
  - rechazarlo;
  - desactivar una cuenta ya desactivada;
  - aprobar una cuenta ya activa.
