import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Header.css'

function Header() {
  const { openModal } = useContext(OrderModalContext)

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">Złota Rączka</Link>
        <button onClick={openModal} className="header__btn" style={{ border: 'none', background: 'inherit', padding: 'inherit', cursor: 'pointer' }}>
          <Phone size={15} /> Zadzwoń
        </button>
      </div>
    </header>
  )
}

export default Header
