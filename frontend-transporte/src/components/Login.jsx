import { useState } from 'react'
import api, { getErrorMessage } from '../api/api.js'

export default function Login({ onLogin, goToRegister }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal "Recuperar contraseña" (solo visual, no toca el backend)
  const [showRecover, setShowRecover] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // POST /api/auth/login  ->  { token, user }
      const { data } = await api.post('/auth/login', { correo, contrasena })
      onLogin(data.token, data.user)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dv-auth">
      {/* Barra superior blanca con logo D' VIAJE y menú */}
      <header className="dv-topbar">
        <div className="dv-brand">
          <span className="dv-brand-mark">D'<br />VIAJE</span>
          <span className="dv-brand-text">D´ VIAJE</span>
        </div>
        <button type="button" className="dv-burger" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </header>

      {/* Zona central con la tarjeta de login */}
      <div className="dv-auth-body">
        <div className="dv-login-card">
          {/* Columna izquierda: imagen de los vehículos */}
          <div className="dv-login-photo">
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80"
              alt="Vehículos D' Viaje"
              loading="lazy"
            />
          </div>

          {/* Columna derecha: formulario */}
          <form onSubmit={handleSubmit} className="dv-login-form">
            {/* Avatar de usuario */}
            <div className="dv-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="46" height="46" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            </div>

            <h1 className="dv-login-title">Iniciar sesión</h1>

            <input
              className="dv-input"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Email"
              required
            />

            <input
              className="dv-input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Contraseña"
              required
            />

            {error && <div className="alert error dv-login-alert">{error}</div>}

            <button type="submit" className="dv-login-btn" disabled={loading}>
              {loading ? 'Entrando…' : 'Login'}
            </button>

            <div className="dv-login-links">
              <button
                type="button"
                className="dv-link"
                onClick={() => setShowRecover(true)}
              >
                Olvidaste tu contraseña?
              </button>
              <button type="button" className="dv-link" onClick={goToRegister}>
                Aun no tienes cuenta?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal: Recuperar contraseña (página 3 del mockup) */}
      {showRecover && (
        <RecoverModal onClose={() => setShowRecover(false)} />
      )}
    </div>
  )
}

/* ---- Modal "Recuperar contraseña" — flujo de varios pasos (solo visual) ----
   Pasos: 'email' -> 'code' -> 'newpass' -> 'success'
   No toca el backend: cada "Validar" avanza al siguiente paso.            */
function RecoverModal({ onClose }) {
  const [step, setStep] = useState('email')

  // Campos del flujo
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [error, setError] = useState('')

  const goTo = (next) => { setError(''); setStep(next) }

  const submitEmail = (e) => { e.preventDefault(); goTo('code') }
  const submitCode = (e) => { e.preventDefault(); goTo('newpass') }
  const submitNewPass = (e) => {
    e.preventDefault()
    if (pass !== pass2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    goTo('success')
  }

  const isSuccess = step === 'success'

  return (
    <div className="dv-modal-backdrop" onClick={onClose}>
      <div className="dv-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dv-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {/* Ícono: candado en los pasos normales, check en el paso final */}
        {isSuccess ? (
          <div className="dv-modal-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none"
              stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
        ) : (
          <div className="dv-modal-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="52" height="52" fill="currentColor">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
            </svg>
          </div>
        )}

        <h2 className="dv-modal-title">
          {isSuccess ? 'Contraseña reestablecida' : 'Recuperar contraseña'}
        </h2>

        {/* PASO 1: pedir email */}
        {step === 'email' && (
          <form onSubmit={submitEmail} className="dv-modal-form">
            <label className="dv-modal-label">Email:</label>
            <input
              className="dv-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@123.com"
              required
            />
            <button type="submit" className="dv-login-btn">Enviar código</button>
          </form>
        )}

        {/* PASO 2: validar código */}
        {step === 'code' && (
          <form onSubmit={submitCode} className="dv-modal-form">
            <p className="dv-modal-sent">
              El codigo de recuperacion fue enviado a tu correo
            </p>
            <label className="dv-modal-label">Código:</label>
            <input
              className="dv-input dv-input-center"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX"
              required
            />
            <button type="submit" className="dv-login-btn">Validar</button>
            <button
              type="button"
              className="dv-link dv-modal-link"
              onClick={() => goTo('code')}
            >
              Reenviar codigo
            </button>
          </form>
        )}

        {/* PASO 3: nueva contraseña */}
        {step === 'newpass' && (
          <form onSubmit={submitNewPass} className="dv-modal-form">
            <p className="dv-modal-sent">Ingrese su nueva contraseña:</p>

            <label className="dv-modal-label">Nueva contraseña</label>
            <input
              className="dv-input"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Ingrese su nueva contraseña"
              required
            />

            <label className="dv-modal-label">Confirmar contraseña</label>
            <input
              className="dv-input"
              type="password"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />

            {error && <div className="alert error dv-login-alert">{error}</div>}

            <button type="submit" className="dv-login-btn">Validar</button>
          </form>
        )}

        {/* PASO 4: éxito */}
        {isSuccess && (
          <>
            <p className="dv-modal-sent">
              Su contraseña ha sido reestablecida con exito
            </p>
            <button type="button" className="dv-login-btn" onClick={onClose}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
