import { useState } from 'react'
import api, { getErrorMessage } from '../api/api.js'
import { buildInitialValues, buildPayload } from '../helpers.js'

// Formulario que sirve para CREAR y EDITAR cualquier tabla.
// Props:
//   entity     -> configuración de la tabla (de entities.js)
//   row        -> fila a editar (o null si es creación)
//   onClose    -> cerrar sin guardar
//   onSaved    -> avisar que se guardó (para recargar la tabla)
export default function EntityForm({ entity, row, onClose, onSaved }) {
  const isEdit = !!row
  const [values, setValues] = useState(() =>
    buildInitialValues(entity.fields, row)
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = buildPayload(entity.fields, values)
      if (isEdit) {
        const id = row[entity.pk]
        // PUT /api/<endpoint>/<id>
        await api.put(`/${entity.endpoint}/${id}`, payload)
      } else {
        // POST /api/<endpoint>
        await api.post(`/${entity.endpoint}`, payload)
      }
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>
            {isEdit ? 'Editar' : 'Nuevo'} · {entity.label}
          </h2>
          <button className="iconbtn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-body">
          {entity.fields.map((f) => (
            <div className="field" key={f.name}>
              {f.type === 'checkbox' ? (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!values[f.name]}
                    onChange={(e) => setField(f.name, e.target.checked)}
                  />
                  <span>{f.label}</span>
                </label>
              ) : (
                <>
                  <span className="field-label">
                    {f.label}
                    {f.required && <em className="req"> *</em>}
                  </span>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={values[f.name]}
                      onChange={(e) => setField(f.name, e.target.value)}
                      required={f.required}
                    />
                  ) : (
                    <input
                      type={
                        f.type === 'datetime'
                          ? 'datetime-local'
                          : f.type === 'number'
                          ? 'number'
                          : f.type === 'date'
                          ? 'date'
                          : f.type === 'email'
                          ? 'email'
                          : 'text'
                      }
                      step={f.type === 'number' ? 'any' : undefined}
                      value={values[f.name]}
                      onChange={(e) => setField(f.name, e.target.value)}
                      required={f.required}
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {error && <div className="alert error">{error}</div>}

          <div className="drawer-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
