// ============================================================
// Punto de entrada del MODO DEMOSTRACIÓN (npm run demo).
// Monta la misma aplicación, pero sustituye las llamadas HTTP por
// un backend simulado en memoria. Nada de esto entra en el build
// de producción: solo lo carga demo.html.
// ============================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.jsx'
import api from '../api/api.js'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { almacen, siguienteId } from './datos.js'
import '../index.css'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

const responder = (config, status, data) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config
})

const fallar = (config, status, error) => {
  const err = new Error(error)
  err.config = config
  err.response = { status, data: { error }, config, headers: {} }
  return Promise.reject(err)
}

// La sesión real vive en una cookie httpOnly que el navegador maneja solo.
// Aquí se imita con una variable: mientras valga null, /auth/me responde 401
// y la aplicación enseña la portada pública.
let sesionDemo = null

api.defaults.adapter = async (config) => {
  await espera(220) // latencia simulada para ver los estados de carga

  const ruta = (config.url || '').replace(/^\//, '')
  const [recurso, id] = ruta.split('/')
  const metodo = (config.method || 'get').toLowerCase()
  const cuerpo = config.data ? JSON.parse(config.data) : {}

  // ---- Autenticación simulada
  if (recurso === 'auth') {
    if (id === 'login') {
      if (!cuerpo.correo || !cuerpo.contrasena) {
        return fallar(config, 400, 'Correo y contraseña son obligatorios')
      }
      if (String(cuerpo.contrasena).length < 6) {
        return fallar(config, 401, 'El correo o la contraseña son incorrectos.')
      }
      sesionDemo = {
        id_usuario: 'demo',
        nombre: 'Administrador de prueba',
        correo: cuerpo.correo,
        id_rol: 1,
        rol: 'Administrador',
        nivel_permiso: 3,
        id_conductor: null
      }
      return responder(config, 200, { message: 'Login exitoso', user: sesionDemo })
    }

    if (id === 'me') {
      if (!sesionDemo) return fallar(config, 401, 'No hay sesion activa. Inicia sesion.')
      return responder(config, 200, { user: sesionDemo })
    }

    if (id === 'logout') {
      sesionDemo = null
      return responder(config, 200, { message: 'Sesion cerrada' })
    }
  }

  const registro = almacen.get(recurso)
  if (!registro) return fallar(config, 404, `Recurso «${recurso}» no existe en la demo`)

  const pk = registro.entidad.pk

  if (metodo === 'get') return responder(config, 200, registro.filas)

  if (metodo === 'post') {
    const nueva = { ...cuerpo, [pk]: siguienteId(registro) }
    registro.filas.unshift(nueva)
    return responder(config, 201, { success: true, data: nueva })
  }

  if (metodo === 'put') {
    const i = registro.filas.findIndex((f) => String(f[pk]) === String(id))
    if (i === -1) return fallar(config, 404, 'Registro no encontrado')
    registro.filas[i] = { ...registro.filas[i], ...cuerpo }
    return responder(config, 200, { success: true, data: registro.filas[i] })
  }

  if (metodo === 'delete') {
    const i = registro.filas.findIndex((f) => String(f[pk]) === String(id))
    if (i === -1) return fallar(config, 404, 'Registro no encontrado')
    registro.filas.splice(i, 1)
    return responder(config, 200, { success: true })
  }

  return fallar(config, 405, 'Método no permitido en la demo')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <div className="demo-aviso">
          Modo demostración · entra con cualquier correo y una contraseña de 6+ caracteres
        </div>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
