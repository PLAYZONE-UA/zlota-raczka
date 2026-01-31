import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './Login.css'

function Login() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Простой пароль для входа (в боевом приложении использовать безопасное хранилище)
  const ADMIN_PASSWORD = 'zlota2024'

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (password === ADMIN_PASSWORD) {
        // Сохраняем токен в localStorage
        localStorage.setItem('adminToken', 'authenticated')
        toast.success('Zalogowany pomyślnie!')
        navigate('/admin')
      } else {
        toast.error('Nieprawidłowe hasło')
      }
    } catch (error) {
      toast.error('Błąd logowania')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/')
    toast.info('Wylogowany')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Złota Rączka Admin</h1>
        <p className="login-subtitle">Panel zarządzania zamówieniami</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="password">Hasło dostępu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wpisz hasło"
              required
              autoFocus
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className="login-info">
          <p>📱 Dostęp z telefonu</p>
          <p>🔒 Bezpieczna administracja</p>
        </div>
      </div>
    </div>
  )
}

export default Login
