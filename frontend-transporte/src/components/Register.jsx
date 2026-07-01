import { useState, useEffect } from 'react'
import axios from 'axios'
import api, { getErrorMessage } from '../api/api.js'

export default function Register({ goToLogin }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    id_rol: ''
  })
  const [roles, setRoles] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  // Carga la lista real de roles desde Supabase (catálogo público) para que
  // el usuario elija uno válido y nunca se envíe un id_rol inexistente.
  useEffect(() => {
    const supaUrl = import.meta.env.VITE_SUPABASE_URL
    const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!supaUrl || !supaKey) return
    axios
      .get(`${supaUrl}/rest/v1/roles?select=id_rol,nombre_rol&order=id_rol`, {
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` }
      })
      .then(({ data }) => {
        setRoles(data)
        // Selecciona el primer rol disponible por defecto
        if (data.length > 0) {
          setForm((f) => ({ ...f, id_rol: String(data[0].id_rol) }))
        }
      })
      .catch(() => {
        // Si no se pueden cargar, se deja el campo vacío (el usuario verá el aviso)
      })
  }, [])

  const update = (campo) => (e) =>
    setForm({ ...form, [campo]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')

    if (!form.id_rol) {
      setError('Selecciona un rol válido antes de continuar.')
      return
    }

    setLoading(true)
    try {
      // El backend espera id_rol como número
      const payload = { ...form, id_rol: Number(form.id_rol) }
      // POST /api/auth/register
      await api.post('/auth/register', payload)
      setOk('Usuario registrado con éxito. Ya puedes iniciar sesión.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-mark">◈</span>
          <span>Transporte</span>
        </div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-sub">Registra un usuario para administrar el sistema.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="grid-2">
            <label className="field">
              <span>Nombre</span>
              <input value={form.nombre} onChange={update('nombre')} required />
            </label>
            <label className="field">
              <span>Apellido</span>
              <input value={form.apellido} onChange={update('apellido')} required />
            </label>
          </div>

          <label className="field">
            <span>Correo</span>
            <input type="email" value={form.correo} onChange={update('correo')} required />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              value={form.contrasena}
              onChange={update('contrasena')}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>

          <div className="grid-2">
            <label className="field">
              <span>Teléfono</span>
              <input value={form.telefono} onChange={update('telefono')} />
            </label>
            <label className="field">
              <span>Rol</span>
              <select value={form.id_rol} onChange={update('id_rol')} required>
                {roles.length === 0 && <option value="">Cargando roles…</option>}
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre_rol}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <div className="alert error">{error}</div>}
          {ok && <div className="alert success">{ok}</div>}

          <button type="submit" className="btn primary block" disabled={loading}>
            {loading ? 'Registrando…' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-foot">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="linkbtn" onClick={goToLogin}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  )
}
