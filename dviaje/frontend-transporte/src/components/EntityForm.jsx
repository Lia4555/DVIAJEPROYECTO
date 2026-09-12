import { useMemo, useRef, useState } from 'react'
import api, { getErrorMessage, getFieldErrors } from '../api/api.js'
import { buildInitialValues, buildPayload, hayCambios, validateValues } from '../lib/form.js'
import { useDialog } from '../hooks/useDialog.js'
import ConfirmDialog from './ui/ConfirmDialog.jsx'
import { IconAlerta, IconCerrar } from './ui/Icons.jsx'

// Los campos largos ocupan todo el ancho del panel; los cortos van en 2 columnas.
const ANCHO_COMPLETO = ['textarea']

function tipoDeInput(tipo) {
  switch (tipo) {
    case 'datetime':
      return 'datetime-local'
    case 'number':
      return 'number'
    case 'date':
      return 'date'
    case 'email':
      return 'email'
    default:
      return 'text'
  }
}

/**
 * Panel lateral que sirve para CREAR, EDITAR y VER el detalle de cualquier tabla.
 * @param entity      configuración de la tabla (entities.js)
 * @param row         fila a editar / ver (null si es creación)
 * @param soloLectura muestra el detalle sin permitir cambios
 * @param onSaved     recibe el mensaje de éxito para el aviso
 */
export default function EntityForm({
  entity,
  row,
  soloLectura = false,
  referencias = {},
  cargandoRefs = false,
  onClose,
  onSaved
}) {
  const esEdicion = !!row
  const valoresIniciales = useMemo(
    () => buildInitialValues(entity.fields, row),
    [entity, row]
  )

  const [values, setValues] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmarCierre, setConfirmarCierre] = useState(false)
  const formRef = useRef(null)

  const intentarCerrar = () => {
    if (guardando) return
    if (!soloLectura && hayCambios(valoresIniciales, values)) {
      setConfirmarCierre(true)
      return
    }
    onClose()
  }

  const ref = useDialog(intentarCerrar)

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => {
      if (!prev[name]) return prev
      const copia = { ...prev }
      delete copia[name]
      return copia
    })
  }

  const enfocarPrimerError = (mapa) => {
    const primero = entity.fields.find((f) => mapa[f.name])
    if (!primero) return
    const elemento = formRef.current?.querySelector(`[name="${primero.name}"]`)
    if (elemento) elemento.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (soloLectura) return

    setErrorGeneral('')
    const problemas = validateValues(entity.fields, values)
    if (Object.keys(problemas).length > 0) {
      setErrores(problemas)
      setErrorGeneral('Revisa los campos marcados en rojo antes de guardar.')
      enfocarPrimerError(problemas)
      return
    }

    setGuardando(true)
    try {
      const payload = buildPayload(entity.fields, values)
      if (esEdicion) {
        await api.put(`/${entity.endpoint}/${row[entity.pk]}`, payload)
      } else {
        await api.post(`/${entity.endpoint}`, payload)
      }
      onSaved(
        esEdicion
          ? 'Los cambios se guardaron correctamente.'
          : `Se creó el registro en ${entity.label}.`
      )
    } catch (err) {
      // Errores de validación de Zod -> se pintan junto a cada campo
      const porCampo = getFieldErrors(err)
      setErrores(porCampo)
      setErrorGeneral(getErrorMessage(err))
      if (Object.keys(porCampo).length > 0) enfocarPrimerError(porCampo)
    } finally {
      setGuardando(false)
    }
  }

  // ¿La lista de la tabla relacionada está disponible (o cargando)?
  const hayLista = (f) => !!referencias[f.ref] || cargandoRefs

  // Opciones de una lista desplegable: SIEMPRE con el nombre (o la placa),
  // nunca con el código. Si el registro guardado apunta a algo que ya no
  // existe, se deja una opción marcada para no borrarlo sin querer al guardar.
  const opcionesDe = (f) => {
    const lista = referencias[f.ref]?.opciones || []
    const actual = values[f.name]
    const vacio = actual === '' || actual === null || actual === undefined
    if (vacio || lista.some((o) => o.valor === String(actual))) return lista
    return [...lista, { valor: String(actual), etiqueta: 'Valor actual (ya no está en la lista)' }]
  }

  const titulo = soloLectura ? 'Detalle' : esEdicion ? 'Editar' : 'Nuevo registro'

  return (
    <>
      <div className="drawer-backdrop" onMouseDown={intentarCerrar}>
        <aside
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          ref={ref}
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <header className="drawer-head">
            <div>
              <p className="drawer-eyebrow">{entity.label}</p>
              {/* Sin el código del registro: no le sirve a nadie y ensucia
                  la cabecera. Para saber cuál es, está el propio formulario. */}
              <h2 id="drawer-title">{titulo}</h2>
            </div>
            <button type="button" className="iconbtn" onClick={intentarCerrar} aria-label="Cerrar panel">
              <IconCerrar />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="drawer-form" ref={formRef} noValidate>
            <div className="drawer-body">
              {!soloLectura && (
                <p className="form-note">
                  Los campos marcados con <em className="req">*</em> son obligatorios.
                </p>
              )}

              <div className="form-grid">
                {entity.fields.map((f) => {
                  const idCampo = `campo-${f.name}`
                  const idError = `${idCampo}-error`
                  const idAyuda = `${idCampo}-ayuda`
                  const tieneError = !!errores[f.name]
                  const ancho = ANCHO_COMPLETO.includes(f.type) ? 'span-2' : ''

                  if (f.type === 'checkbox') {
                    return (
                      <div className="field span-2" key={f.name}>
                        <label className="check">
                          <input
                            id={idCampo}
                            name={f.name}
                            type="checkbox"
                            checked={!!values[f.name]}
                            disabled={soloLectura}
                            onChange={(e) => setField(f.name, e.target.checked)}
                          />
                          <span>{f.label}</span>
                        </label>
                        {f.hint && <p className="field-hint" id={idAyuda}>{f.hint}</p>}
                      </div>
                    )
                  }

                  const comunes = {
                    id: idCampo,
                    name: f.name,
                    value: values[f.name] ?? '',
                    disabled: soloLectura,
                    'aria-invalid': tieneError || undefined,
                    'aria-describedby':
                      [tieneError ? idError : null, f.hint ? idAyuda : null]
                        .filter(Boolean)
                        .join(' ') || undefined,
                    onChange: (e) => setField(f.name, e.target.value)
                  }

                  return (
                    <div className={`field ${ancho} ${tieneError ? 'has-error' : ''}`} key={f.name}>
                      <label className="field-label" htmlFor={idCampo}>
                        {f.label}
                        {f.required && !soloLectura && <em className="req"> *</em>}
                      </label>

                      {f.type === 'textarea' ? (
                        <textarea rows={3} {...comunes} />
                      ) : f.ref && hayLista(f) ? (
                        // Llave foránea: se elige por nombre, se guarda el id
                        <select {...comunes} disabled={soloLectura || cargandoRefs}>
                          <option value="">
                            {cargandoRefs ? 'Cargando opciones…' : '— Selecciona —'}
                          </option>
                          {opcionesDe(f).map((o) => (
                            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                          ))}
                        </select>
                      ) : f.type === 'select' ? (
                        <select {...comunes}>
                          <option value="">— Selecciona —</option>
                          {f.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={tipoDeInput(f.type)}
                          step={f.type === 'number' ? (f.integer ? '1' : 'any') : undefined}
                          min={f.min}
                          inputMode={f.type === 'number' ? 'decimal' : undefined}
                          autoComplete="off"
                          {...comunes}
                        />
                      )}

                      {tieneError ? (
                        <p className="field-error" id={idError}>{errores[f.name]}</p>
                      ) : f.ref && !hayLista(f) ? (
                        <p className="field-hint">
                          No se pudo cargar la lista de «{f.label}». Vuelve a cargar la página
                          para elegirlo por su nombre.
                        </p>
                      ) : (
                        f.hint && <p className="field-hint" id={idAyuda}>{f.hint}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {errorGeneral && (
                <div className="alert error" role="alert">
                  <IconAlerta size={18} />
                  <span>{errorGeneral}</span>
                </div>
              )}
            </div>

            <footer className="drawer-actions">
              <button type="button" className="btn ghost" onClick={intentarCerrar} disabled={guardando}>
                {soloLectura ? 'Cerrar' : 'Cancelar'}
              </button>
              {!soloLectura && (
                <button type="submit" className="btn primary" disabled={guardando}>
                  {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear registro'}
                </button>
              )}
            </footer>
          </form>
        </aside>
      </div>

      {confirmarCierre && (
        <ConfirmDialog
          titulo="Descartar cambios"
          mensaje="Hiciste cambios que todavía no se han guardado."
          detalle="Si sales ahora, se perderán."
          textoConfirmar="Descartar"
          textoCancelar="Seguir editando"
          peligro
          onConfirm={onClose}
          onCancel={() => setConfirmarCierre(false)}
        />
      )}
    </>
  )
}
