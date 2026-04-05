import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Phone, LogOut } from 'lucide-react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Header.css'

function Header() {
  const { openModal } = useContext(OrderModalContext)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showRealizacje, setShowRealizacje] = useState(true)

  useEffect(() => {
    // Перевіряємо чи користувач увійшов
    const adminToken = localStorage.getItem('adminToken')
    setIsAdmin(!!adminToken)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Приховуємо кнопку Realizacje при scroll
      setShowRealizacje(window.scrollY === 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__content">
          <Link to="/" className="header__brand">Złota Rączka – Twój „mąż na godzinę"</Link>
          <div className="header__buttons">
            <button onClick={openModal} className="header__order-btn">Zamów usługę</button>
            <a href="tel:+48574621560" className="header__call-btn">Zadzwoń teraz</a>
            {showRealizacje && (
              <Link to="/realizacje" className="header__realizacje-btn">Realizacje</Link>
            )}
          </div>
        </div>
        <div className="header__actions">
        </div>
      </div>
    </header>
  )
}

export default Header
