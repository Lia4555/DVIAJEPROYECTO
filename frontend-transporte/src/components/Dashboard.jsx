import { useState } from 'react'
import { entities, groups } from '../entities.js'
import DataTable from './DataTable.jsx'

export default function Dashboard({ onLogout }) {
  const [activeKey, setActiveKey] = useState(entities[0].key)
  const [menuOpen, setMenuOpen] = useState(false)

  const activeEntity = entities.find((e) => e.key === activeKey)

  // Usuario guardado (para mostrar el correo)
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    user = {}
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="auth-mark">◈</span>
          <span>Transporte</span>
        </div>

        <nav className="nav">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-group-title">{group}</p>
              {entities
                .filter((e) => e.group === group)
                .map((e) => (
                  <button
                    key={e.key}
                    className={`nav-item ${e.key === activeKey ? 'active' : ''}`}
                    onClick={() => {
                      setActiveKey(e.key)
                      setMenuOpen(false)
                    }}
                  >
                    {e.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="iconbtn menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            ☰
          </button>
          <div className="topbar-user">
            <span className="user-mail">{user?.correo || 'Sesión activa'}</span>
            <button className="btn ghost small" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="content">
          {activeEntity && <DataTable key={activeEntity.key} entity={activeEntity} />}
        </main>
      </div>
    </div>
  )
}
