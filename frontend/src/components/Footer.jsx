import { useContext } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Footer.css'

function Footer() {
  const { openModal } = useContext(OrderModalContext)

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">Złota Rączka • Legionowo i okolice</p>
        <button onClick={openModal} className="footer__btn" style={{ border: 'none', background: 'inherit', padding: 'inherit', cursor: 'pointer' }}>📞 Zadzwoń teraz</button>
      </div>
    </footer>
  )
}

export default Footer
