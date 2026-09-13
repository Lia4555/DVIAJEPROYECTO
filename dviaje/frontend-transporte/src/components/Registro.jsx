import { useState } from 'react'
import api, { getErrorMessage, getFieldErrors } from '../api/api.js'
import AuthLayout from './AuthLayout.jsx'
import { IconAlerta, IconOjo, IconOjoCerrado, IconOk } from './ui/Icons.jsx'

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const TIPOS_DOCUMENTO = [
  ['CC', 'Cédula de ciudadanía'],
  ['CE', 'Cédula de extranjería'],
  ['PA', 'Pasaporte']
]

const VACIO = {
  nombre: '',
  apellido: '',
  tipo_documento: 'CC',
  numero_documento: '',
  telefono: '',
  correo: '',
  contrasena: '',
  confirmar: ''
}

// Mismas reglas que el backend (controllers/cuentasController.js): se
// validan aquí para avisar al instante, y allí de nuevo porque es lo que manda.
export function validarRegistro(v) {
  const e = {}
  if (v.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.'
  if (v.apellido.trim().length < 2) e.apellido = 'Escribe tu apellido.'
  if (!/^[A-Za-z0-9]{5,20}$/.test(v.numero_documento.trim()))
    e.numero_documento = 'Entre 5 y 20 letras o números, sin puntos ni espacios.'
  if (!/^\+?[0-9 ]{7,20}$/.test(v.telefono.trim())) e.telefono = 'Escribe un teléfono válido.'
  if (!v.correo.trim()) e.correo = 'Escribe tu correo.'
  else if (!RE_EMAIL.test(v.correo.trim())) e.correo = 'El correo no tiene un formato válido.'
  if (v.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.'
  else if (v.contrasena.length > 72) e.contrasena = 'Máximo 72 caracteres.'
  if (v.confirmar !== v.contrasena) e.confirmar = 'Las contraseñas no coinciden.'
  return e
}

export default function Registro({ onIrALogin, onVolver }) {
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [verClave, setVerClave] = useState(false)

  const cambiar = (campo) => (e) => {
    const valor = e.target.value
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    const problemas = validarRegistro(valores)
    setErrores(problemas)
    if (Object.keys(problemas).length > 0) return

    setEnviando(true)
    try {
      const { confirmar: _omitida, ...cuerpo } = valores
      await api.post('/auth/register', {
        ...cuerpo,
        nombre: cuerpo.nombre.trim(),
        apellido: cuerpo.apellido.trim(),
        numero_documento: cuerpo.numero_documento.trim(),
        telefono: cuerpo.telefono.trim(),
        correo: cuerpo.correo.trim()
      })
      setEnviada(true)
    } catch (err) {
      const porCampo = getFieldErrors(err)
      if (Object.keys(porCampo).length > 0) setErrores(porCampo)
      setError(getErrorMessage(err))
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) {
    return (
      <AuthLayout
        onVolver={onVolver}
        titulo="Solicitud enviada"
        subtitulo="Tu cuenta quedó registrada como conductor."
      >
        <div className="auth-exito" role="status">
          <span className="auth-exito-icono" aria-hidden="true"><IconOk size={22} /></span>
          <div>
            <strong>Falta un paso: la aprobación.</strong>
            <p>
              Un administrador de la flota debe revisar y aprobar tu cuenta. Cuando lo haga,
              podrás entrar con <strong>{valores.correo.trim()}</strong> y la contraseña que elegiste.
            </p>
          </div>
        </div>
        <button type="button" className="btn primary block" onClick={onIrALogin}>
          Ir a iniciar sesión
        </button>
      </AuthLayout>
    )
  }

  const campo = (nombre, etiqueta, props = {}) => (
    <div className={`field ${errores[nombre] ? 'has-error' : ''}`}>
      <label className="field-label" htmlFor={`reg-${nombre}`}>{etiqueta}</label>
      <input
        id={`reg-${nombre}`}
        value={valores[nombre]}
        onChange={cambiar(nombre)}
        aria-invalid={!!errores[nombre]}
        aria-describedby={errores[nombre] ? `reg-${nombre}-error` : undefined}
        {...props}
      />
      {errores[nombre] && (
        <p className="field-error" id={`reg-${nombre}-error`}>{errores[nombre]}</p>
      )}
    </div>
  )

  return (
    <AuthLayout
      onVolver={onVolver}
      titulo="Crear una cuenta"
      subtitulo="Regístrate como conductor. Un administrador aprobará tu acceso."
    >
      <form onSubmit={enviar} className="auth-form" noValidate>
        <div className="grid-2">
          {campo('nombre', 'Nombre', { autoComplete: 'given-name', autoFocus: true })}
          {campo('apellido', 'Apellido', { autoComplete: 'family-name' })}
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label" htmlFor="reg-tipo_documento">Tipo de documento</label>
            <select
              id="reg-tipo_documento"
              value={valores.tipo_documento}
              onChange={cambiar('tipo_documento')}
            >
              {TIPOS_DOCUMENTO.map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
          </div>
          {campo('numero_documento', 'Número de documento', { inputMode: 'text' })}
        </div>

        {campo('telefono', 'Teléfono', { type: 'tel', autoComplete: 'tel', placeholder: '300 000 0000' })}
        {campo('correo', 'Correo', { type: 'email', autoComplete: 'email', placeholder: 'tucorreo@empresa.com' })}

        <div className={`field ${errores.contrasena ? 'has-error' : ''}`}>
          <label className="field-label" htmlFor="reg-contrasena">Contraseña</label>
          <div className="input-con-boton">
            <input
              id="reg-contrasena"
              type={verClave ? 'text' : 'password'}
              value={valores.contrasena}
              onChange={cambiar('contrasena')}
              autoComplete="new-password"
              aria-invalid={!!errores.contrasena}
              aria-describedby="reg-contrasena-ayuda"
            />
            <button
              type="button"
              className="iconbtn"
              onClick={() => setVerClave((v) => !v)}
              aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verClave ? <IconOjoCerrado size={17} /> : <IconOjo size={17} />}
            </button>
          </div>
          {errores.contrasena ? (
            <p className="field-error" id="reg-contrasena-ayuda">{errores.contrasena}</p>
          ) : (
            <p className="field-hint" id="reg-contrasena-ayuda">Mínimo 8 caracteres.</p>
          )}
        </div>

        {campo('confirmar', 'Repite la contraseña', {
          type: verClave ? 'text' : 'password',
          autoComplete: 'new-password'
        })}

        {error && (
          <div className="alert error" role="alert">
            <IconAlerta size={18} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn primary block" disabled={enviando}>
          {enviando ? 'Enviando solicitud…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-foot">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="linkbtn" onClick={onIrALogin}>
          Inicia sesión
        </button>
      </p>
    </AuthLayout>
  )
}
