// ============================================================
// Pruebas automáticas del frontend (sin dependencias extra).
// Se ejecutan con:  npm test
//
// 1. Humo: cada pantalla se renderiza sin lanzar errores.
// 2. Lógica: paginación, validaciones, formato, roles y que
//    los códigos internos (ids) no aparezcan en pantalla.
// ============================================================
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App.jsx'
import Dashboard from '../src/components/Dashboard.jsx'
import Landing from '../src/components/Landing.jsx'
import Login from '../src/components/Login.jsx'
import EntityForm from '../src/components/EntityForm.jsx'
import PanelConductor from '../src/components/conductor/PanelConductor.jsx'
import Pagination from '../src/components/ui/Pagination.jsx'
import { PasoSecciones } from '../src/components/ui/Navegador.jsx'
import { ToastProvider } from '../src/components/ui/Toast.jsx'
import { entities, entidadesVisibles, groups } from '../src/entities.js'
import { buildInitialValues, buildPayload, validateValues } from '../src/lib/form.js'
import {
  columnLabel,
  compareValues,
  fechaCorta,
  formatValue,
  pesos,
  textoVigencia
} from '../src/lib/format.js'
import { esAdmin, esConductor, iniciales, nombreVisible, puedeEscribir } from '../src/lib/session.js'
import { etiquetaDeFila, referenciasDe } from '../src/lib/referencias.js'

let fallos = 0

const chequear = (nombre, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado)
  if (!ok) fallos++
  console.log(
    `${ok ? '  OK  ' : ' FALLA'} ${nombre}` +
      (ok ? '' : `\n        esperado: ${JSON.stringify(esperado)}\n        recibido: ${JSON.stringify(real)}`)
  )
}

const renderiza = (nombre, elemento) => {
  try {
    const html = renderToString(elemento)
    console.log(`  OK   ${nombre} (${html.length} caracteres)`)
    return html
  } catch (e) {
    fallos++
    console.log(` FALLA ${nombre}: ${e.message}`)
    return ''
  }
}

// ---------------------------------------------------- 1. HUMO
console.log('\n· Renderizado de pantallas')

const admin = {
  correo: 'admin@dviaje.com',
  nombre: 'Diego Rojas',
  rol: 'Administrador',
  nivel_permiso: 3
}
const conductor = {
  correo: 'ana@dviaje.com',
  nombre: 'Ana Ruiz',
  rol: 'Conductor',
  nivel_permiso: 2,
  id_conductor: 'u1'
}

const servicios = entities.find((e) => e.key === 'servicios')
const vehiculos = entities.find((e) => e.key === 'vehiculos')

// La navegación la crea App.jsx y se pasa a los paneles: aquí se simula.
const navFalso = (ruta) => ({
  ruta,
  ir: () => {},
  atras: () => {},
  adelante: () => {},
  puedeVolver: true,
  puedeAvanzar: false
})

const PRIMERA_ADMIN = groups.flatMap((g) => entidadesVisibles.filter((e) => e.group === g))[0].key

renderiza('Arranque (comprobando la sesión)', <ToastProvider><App /></ToastProvider>)
renderiza('Landing (empresa)', <Landing onIngresar={() => {}} />)
renderiza('Login', <ToastProvider><Login onLogin={() => {}} onVolver={() => {}} /></ToastProvider>)
renderiza('Panel del administrador', <ToastProvider><Dashboard usuario={admin} nav={navFalso(PRIMERA_ADMIN)} onLogout={() => {}} /></ToastProvider>)
renderiza('Panel del conductor', <ToastProvider><PanelConductor usuario={conductor} nav={navFalso('mis-servicios')} onLogout={() => {}} /></ToastProvider>)
renderiza('Formulario nuevo', <ToastProvider><EntityForm entity={servicios} row={null} onClose={() => {}} onSaved={() => {}} /></ToastProvider>)
renderiza(
  'Formulario detalle',
  <ToastProvider>
    <EntityForm
      entity={vehiculos}
      row={{ id_vehiculo: 3, placa: 'ABC123', estado_operativo: true }}
      soloLectura
      onClose={() => {}}
      onSaved={() => {}}
    />
  </ToastProvider>
)

const portada = renderToStaticMarkup(<Landing onIngresar={() => {}} />)
chequear('la portada muestra las 5 fotos de la flota', portada.split('src="/img/').length - 1, 5)
chequear('la portada enlaza las 4 secciones', ['#empresa','#servicios','#flota','#contacto'].every((a) => portada.includes(a)), true)
chequear('todas las imágenes tienen texto alternativo', (portada.match(/<img/g)||[]).length, (portada.match(/alt=/g)||[]).length)
chequear('ya no se ofrece crear una cuenta', portada.includes('Crear una cuenta'), false)

const pantallaLogin = renderToStaticMarkup(
  <ToastProvider><Login onLogin={() => {}} onVolver={() => {}} /></ToastProvider>
)
chequear('el login no enlaza a un registro público', pantallaLogin.includes('Crear una cuenta'), false)

// -------------------------------------------- 2. NAVEGACIÓN
console.log('\n· Navegación entre pantallas')

const panelAdmin = renderToStaticMarkup(
  <ToastProvider><Dashboard usuario={admin} nav={navFalso(PRIMERA_ADMIN)} onLogout={() => {}} /></ToastProvider>
)
chequear('el panel trae las flechas Atrás y Adelante', [
  panelAdmin.includes('Volver a la pantalla anterior'),
  panelAdmin.includes('Ir a la pantalla siguiente')
], [true, true])

const panelConductor = renderToStaticMarkup(
  <ToastProvider><PanelConductor usuario={conductor} nav={navFalso('mis-servicios')} onLogout={() => {}} /></ToastProvider>
)
chequear('el conductor solo ve sus tres secciones', [
  panelConductor.includes('Mis servicios'),
  panelConductor.includes('Mi vehículo'),
  panelConductor.includes('Mis alertas'),
  panelConductor.includes('Clientes'),
  panelConductor.includes('Reservas')
], [true, true, true, false, false])

const paso = renderToStaticMarkup(
  <PasoSecciones
    anterior={{ key: 'a', label: 'Vehículos' }}
    siguiente={{ key: 'b', label: 'Servicios' }}
    onIr={() => {}}
  />
)
chequear('el pie ofrece la sección anterior y la siguiente', [
  paso.includes('Anterior') && paso.includes('Vehículos'),
  paso.includes('Siguiente') && paso.includes('Servicios')
], [true, true])

const pasoPrimera = renderToStaticMarkup(
  <PasoSecciones anterior={null} siguiente={{ key: 'b', label: 'Servicios' }} onIr={() => {}} />
)
chequear('en la primera sección no hay flecha «Anterior»', pasoPrimera.includes('Anterior'), false)

// ---------------------------------------------- 3. PAGINACIÓN
console.log('\n· Paginación')

const paginacion = (pagina, total, tamano = 10) => {
  const html = renderToStaticMarkup(
    <Pagination pagina={pagina} tamano={tamano} total={total} onPagina={() => {}} onTamano={() => {}} />
  )
  return {
    botones: [...html.matchAll(/aria-label="Página (\d+)"/g)].map((m) => Number(m[1])),
    huecos: (html.match(/pagination-gap/g) || []).length,
    resumen: (html.match(/Mostrando.*?<\/p>/) || [''])[0].replace(/<[^>]+>/g, ''),
    actual: (html.match(/aria-current="page"[^>]*>(\d+)/) || [])[1]
  }
}

chequear('primera página muestra 1-4 y la última', paginacion(1, 137).botones, [1, 2, 3, 4, 14])
chequear('página intermedia muestra vecinas', paginacion(7, 137).botones, [1, 6, 7, 8, 14])
chequear('última página muestra las 4 finales', paginacion(14, 137).botones, [1, 11, 12, 13, 14])
chequear('sin huecos cuando hay pocas páginas', paginacion(2, 25).huecos, 0)
chequear('dos huecos en el centro', paginacion(7, 137).huecos, 2)
chequear('rango exacto', paginacion(7, 137).resumen, 'Mostrando 61–70 de 137 registros')
chequear('última página parcial', paginacion(14, 137).resumen, 'Mostrando 131–137 de 137 registros')
chequear('mensaje sin datos', paginacion(1, 0).resumen, '')
chequear('tamaño de página respetado', paginacion(2, 137, 50).resumen, 'Mostrando 51–100 de 137 registros')

// ---------------------------------------------- 4. VALIDACIÓN
console.log('\n· Validación de formularios')

const vacios = buildInitialValues(servicios.fields, null)
chequear('detecta todos los obligatorios', Object.keys(validateValues(servicios.fields, vacios)).length, 10)
chequear(
  'UUID mal escrito',
  validateValues(servicios.fields, { ...vacios, id_conductor: '123' }).id_conductor,
  'Debe ser un UUID válido (36 caracteres con guiones).'
)
chequear(
  'fecha de llegada anterior a la salida',
  validateValues(servicios.fields, {
    ...vacios,
    fecha_salida: '2026-01-10T08:00',
    fecha_llegada_estimada: '2026-01-09T08:00'
  }).fecha_llegada_estimada,
  'No puede ser anterior a «Fecha de salida».'
)
chequear(
  'número entero exigido',
  validateValues(servicios.fields, { ...vacios, numero_pasajeros: '2.5' }).numero_pasajeros,
  'Debe ser un número entero.'
)

const conductorEnt = entities.find((e) => e.key === 'conductor')
chequear(
  'el payload recorta espacios, convierte números y omite opcionales vacíos',
  buildPayload(conductorEnt.fields, {
    nombre: ' Ana ',
    apellido: 'Ruiz',
    tipo_documento: 'CC',
    numero_documento: '123',
    email: 'a@b.co',
    telefono: '3001234567',
    fecha_nacimiento: '',
    direccion: '',
    licencia_conduccion: '',
    categoria_licencia: '',
    fecha_expedicion_licencia: '',
    fecha_vencimiento_licencia: '',
    id_rol: '2'
  }),
  {
    nombre: 'Ana',
    apellido: 'Ruiz',
    tipo_documento: 'CC',
    numero_documento: '123',
    email: 'a@b.co',
    telefono: '3001234567',
    id_rol: 2
  }
)

// ------------------------------------------------- 5. FORMATO
console.log('\n· Formato de celdas')

chequear('booleano', formatValue(true), 'Sí')
chequear('valor vacío', formatValue(null), '—')
chequear('fecha sin desfase de zona horaria', formatValue('2026-03-05', { type: 'date' }), '05/03/2026')
chequear('fecha guardada como timestamp', formatValue('2026-03-05T00:00:00.000Z', { type: 'date' }), '05/03/2026')
chequear('un UUID nunca se enseña', formatValue('3f7a1c2e-1111-2222-3333-444455556666'), '—')
chequear('texto largo recortado', formatValue('a'.repeat(60)).length, 45)
chequear('vacíos al final al ordenar', [3, null, 1].sort(compareValues), [1, 3, null])
chequear('encabezado desde la configuración', columnLabel(servicios, 'precio_total'), 'Precio total')
chequear('fecha corta', fechaCorta('2026-03-05'), '05/03/2026')
chequear('sin fecha', fechaCorta(null), '—')
chequear('documento vencido', textoVigencia('2020-01-01').estado, 'vencido')
chequear('documento vigente', textoVigencia('2099-01-01').estado, 'vigente')
chequear('precio en pesos', pesos(150000).replace(/ /g, ' ').startsWith('$'), true)

// ------------------------------ 6. NADA DE CÓDIGOS INTERNOS
console.log('\n· Los ids no se muestran en pantalla')

chequear(
  'ninguna tabla enseña su llave primaria como columna',
  entities.filter((e) => e.columnas?.includes(e.pk)).map((e) => e.key),
  []
)
chequear(
  'sin nombre no se cae al código',
  etiquetaDeFila(conductorEnt, { id_conductor: 'u9' }),
  'Sin nombre'
)
chequear(
  'el conductor se identifica con nombre y apellido',
  etiquetaDeFila(conductorEnt, { id_conductor: 'u1', nombre: 'Ana', apellido: 'Ruiz' }),
  'Ana Ruiz'
)

const destinosEnt = entities.find((e) => e.key === 'destinos')
chequear(
  'el destino incluye la ciudad',
  etiquetaDeFila(destinosEnt, { id_destino: 3, nombre_destino: 'Terminal Norte', ciudad: 'Bogotá' }),
  'Terminal Norte (Bogotá)'
)

const refsFalsas = {
  conductor: {
    opciones: [{ valor: 'u1', etiqueta: 'Ana Ruiz' }],
    mapa: new Map([['u1', 'Ana Ruiz']])
  },
  vehiculos: {
    opciones: [{ valor: '7', etiqueta: 'ABC123 · Hino' }],
    mapa: new Map([['7', 'ABC123 · Hino']])
  },
  destinos: {
    opciones: [{ valor: '2', etiqueta: 'Terminal Norte (Bogotá)' }],
    mapa: new Map([['2', 'Terminal Norte (Bogotá)']])
  },
  'estados-servicio': {
    opciones: [{ valor: '1', etiqueta: 'Programado' }],
    mapa: new Map([['1', 'Programado']])
  }
}

const formulario = renderToStaticMarkup(
  <ToastProvider>
    <EntityForm
      entity={servicios}
      row={null}
      referencias={refsFalsas}
      onClose={() => {}}
      onSaved={() => {}}
    />
  </ToastProvider>
)

chequear('el formulario usa listas desplegables para las 5 llaves foráneas', (formulario.match(/<select/g) || []).length, 5)
chequear('las opciones muestran nombres', formulario.includes('Ana Ruiz') && formulario.includes('ABC123 · Hino'), true)
chequear('los ids ya no se piden a mano', formulario.includes('ID Vehículo'), false)

const detalle = renderToStaticMarkup(
  <ToastProvider>
    <EntityForm
      entity={vehiculos}
      row={{ id_vehiculo: 3, placa: 'ABC123', estado_operativo: true }}
      soloLectura
      referencias={refsFalsas}
      onClose={() => {}}
      onSaved={() => {}}
    />
  </ToastProvider>
)
chequear('la cabecera del detalle no muestra el código', detalle.includes('drawer-id'), false)

chequear(
  'todas las referencias apuntan a tablas existentes',
  entities
    .flatMap((e) => e.fields.filter((f) => f.ref).map((f) => f.ref))
    .filter((clave) => !entities.some((e) => e.key === clave)),
  []
)
chequear(
  'servicios relaciona conductor, vehículo, origen, destino y estado',
  referenciasDe(servicios).sort(),
  ['conductor', 'destinos', 'estados-servicio', 'vehiculos'].sort()
)

// ------------------------------------------- 7. SESIÓN Y ROLES
console.log('\n· Sesión y permisos (solo dos roles)')

chequear('el administrador puede escribir', puedeEscribir(admin), true)
chequear('el conductor no puede escribir', puedeEscribir(conductor), false)
chequear('se reconoce al administrador', esAdmin(admin), true)
chequear('se reconoce al conductor', esConductor(conductor), true)
chequear('sin sesión no hay conductor', esConductor(null), false)
chequear('iniciales del nombre', iniciales(admin), 'DR')
chequear('iniciales desde el correo', iniciales({ correo: 'soporte@dviaje.com' }), 'SO')
chequear('nombre visible', nombreVisible(conductor), 'Ana Ruiz')

// ----------------------------------------------- 8. ENTIDADES
console.log('\n· Configuración de tablas')

chequear('16 tablas configuradas', entities.length, 16)
chequear('la tabla de roles ya no se administra desde el menú', entidadesVisibles.length, 15)
chequear('roles queda oculta', entities.find((e) => e.key === 'roles').oculta, true)
chequear(
  'todas tienen endpoint, llave primaria y campos',
  entities.filter((e) => e.endpoint && e.pk && e.fields?.length > 0).length,
  entities.length
)
chequear(
  'las columnas por defecto existen dentro de los campos',
  entities.filter((e) => e.columnas?.some((c) => !e.fields.some((f) => f.name === c))).map((e) => e.key),
  []
)

console.log(
  fallos === 0
    ? '\n✔ Todas las pruebas pasaron\n'
    : `\n✖ ${fallos} prueba(s) fallaron\n`
)
process.exitCode = fallos === 0 ? 0 : 1
