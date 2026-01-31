import { useContext } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">Złota Rączka – Twój „mąż na godzinę"</p>
      </div>
    </footer>
  )
}

export default Footer
