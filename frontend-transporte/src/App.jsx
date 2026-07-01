import { useState } from 'react'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  // Leemos el token guardado para saber si ya inició sesión
  const [token, setToken] = useState(localStorage.getItem('token'))
  // Controla si en la pantalla de inicio se ve "login" o "registro"
  const [authView, setAuthView] = useState('login')

  // Se llama cuando el login es exitoso
  const handleLogin = (newToken, user) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(newToken)
  }

  // Cierra sesión
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setAuthView('login')
  }

  // Si NO hay token -> pantallas públicas (login / registro)
  if (!token) {
    return authView === 'login' ? (
      <Login onLogin={handleLogin} goToRegister={() => setAuthView('register')} />
    ) : (
      <Register goToLogin={() => setAuthView('login')} />
    )
  }

  // Si hay token -> el panel de administración
  return <Dashboard onLogout={handleLogout} />
}
