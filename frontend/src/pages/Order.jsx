import { useState } from 'react'
import './Order.css'

function Order() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    service: '',
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Zamówienie:', formData)
    alert('Dziękujemy za zamówienie!')
    setShowModal(false)
    setFormData({ name: '', phone: '', date: '', service: '', notes: '' })
  }

  return (
    <div className="order-page">
      <div className="service-section">
        <h1>Złota Rączka</h1>
        <p>Drobne naprawy, montaż i pomoc domowa.<br />Szybko, uczciwie i bez problemów.</p>
        <div className="features">
          Dojazd tego samego dnia • Własne narzędzia • Bez dużych remontów
        </div>
        <button className="btn-order" onClick={() => setShowModal(true)}>Zamów usługę</button>
        <button className="btn-quote">Wyceń usługę</button>
      </div>

      {/* Модальне вікно */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Zamów usługę</h2>
            <form className="order-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Imię i nazwisko</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />

              <label htmlFor="phone">Numer telefonu</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                required 
                placeholder="+48 123 456 789" 
              />

              <label htmlFor="date">Data i godzina</label>
              <input 
                type="datetime-local" 
                id="date" 
                name="date" 
                value={formData.date}
                onChange={handleChange}
                required 
              />

              <label htmlFor="service">Rodzaj usługi</label>
              <select 
                id="service" 
                name="service" 
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="">Wybierz usługę</option>
                <option value="naprawa">Naprawa</option>
                <option value="montaż">Montaż</option>
                <option value="sprzątanie">Sprzątanie</option>
                <option value="inna">Inna</option>
              </select>

              <label htmlFor="notes">Dodatkowe uwagi</label>
              <textarea 
                id="notes" 
                name="notes" 
                rows="3" 
                value={formData.notes}
                onChange={handleChange}
                placeholder="Np. adres, szczegóły..."
              />

              <button type="submit">Zamów</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Order
