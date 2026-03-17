import { useContext } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">Złota Rączka | Profesjonalne prace domowe w Warszawie i okolice</p>
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
          Kontakt: <a href="tel:+48574621560" style={{ textDecoration: 'none', color: '#d4a574' }}>+48 574 621 560</a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
