import { useEffect, useState, useCallback } from 'react'
import api, { getErrorMessage } from '../api/api.js'
import { formatCell } from '../helpers.js'
import EntityForm from './EntityForm.jsx'

// Muestra la tabla de datos de una entidad y maneja el CRUD completo.
export default function DataTable({ entity }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

  // Cargar todos los registros: GET /api/<endpoint>
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/${entity.endpoint}`)
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [entity.endpoint])

  useEffect(() => {
    load()
  }, [load])

  // Eliminar: DELETE /api/<endpoint>/<id>
  const handleDelete = async (row) => {
    const id = row[entity.pk]
    if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/${entity.endpoint}/${id}`)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openCreate = () => {
    setEditingRow(null)
    setFormOpen(true)
  }
  const openEdit = (row) => {
    setEditingRow(row)
    setFormOpen(true)
  }
  const handleSaved = () => {
    setFormOpen(false)
    setEditingRow(null)
    load()
  }

  // Columnas a mostrar: la llave primaria + los campos definidos
  const columns = [entity.pk, ...entity.fields.map((f) => f.name)]

  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h1 className="panel-title">{entity.label}</h1>
          <p className="panel-sub">
            {loading ? 'Cargando…' : `${rows.length} registro(s)`}
          </p>
        </div>
        <div className="panel-actions">
          <button className="btn ghost" onClick={load} disabled={loading}>
            Actualizar
          </button>
          <button className="btn primary" onClick={openCreate}>
            + Nuevo
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="empty">Cargando datos…</div>
        ) : rows.length === 0 ? (
          <div className="empty">
            No hay registros todavía. Crea el primero con «+ Nuevo».
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row[entity.pk] ?? i}>
                  {columns.map((c) => (
                    <td key={c} title={row[c] == null ? '' : String(row[c])}>
                      {formatCell(row[c])}
                    </td>
                  ))}
                  <td className="col-actions">
                    <button className="btn tiny" onClick={() => openEdit(row)}>
                      Editar
                    </button>
                    <button
                      className="btn tiny danger"
                      onClick={() => handleDelete(row)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && (
        <EntityForm
          entity={entity}
          row={editingRow}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </section>
  )
}
