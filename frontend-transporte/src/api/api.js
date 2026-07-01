import axios from 'axios'

// URL base del backend (sale del archivo .env). Si no existe, usa localhost:3000.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Creamos una "instancia" de axios ya configurada con la URL base.
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// INTERCEPTOR DE PETICIÓN:
// Antes de enviar CUALQUIER petición, busca el token guardado y lo añade
// en el header Authorization. Así no tienes que escribirlo en cada llamada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// INTERCEPTOR DE RESPUESTA:
// Si el backend responde 401 (sin token) o 403 (token inválido/vencido),
// borramos la sesión y mandamos al login automáticamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Recarga la app para volver a la pantalla de login
      if (!window.location.hash.includes('login')) {
        window.location.reload()
      }
    }
    return Promise.reject(error)
  }
)

// Función auxiliar: convierte cualquier error de axios en un texto legible,
// incluyendo los errores de validación de Zod que envía tu backend.
export function getErrorMessage(error) {
  const data = error?.response?.data
  if (!data) return error?.message || 'Error de conexión con el servidor'
  if (data.detalles && Array.isArray(data.detalles)) {
    return data.detalles
      .map((d) => `${d.campo}: ${d.mensaje}`)
      .join(' · ')
  }
  return data.error || data.message || 'Ocurrió un error'
}

export default api
