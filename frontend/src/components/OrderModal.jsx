import { useState, useContext } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import { getApiUrl } from '../utils/api-utils'
import './OrderModal.css'

// Version: 1.0.1 - Removed SMS functionality, direct order submission

function OrderModal() {
  const { isOpen, closeModal } = useContext(OrderModalContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    date: '',
    time: '',
    service: '',
    notes: '',
    photos: []
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '')
      setFormData(prev => ({ ...prev, [name]: digits }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setFormData(prev => ({ ...prev, photos: files }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (!formData.phone || formData.phone.length < 9) {
        throw new Error('Podaj prawidłowy numer telefonu')
      }
      if (!formData.address || formData.address.length < 5) {
        throw new Error('Podaj prawidłowy adres')
      }
      if (!formData.date) {
        throw new Error('Wybierz datę')
      }
      if (!formData.service) {
        throw new Error('Wybierz usługę')
      }

      const formDataObj = new FormData()
      formDataObj.append('phone', '+48' + formData.phone)
      formDataObj.append('address', formData.address)
      const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}` : formData.date
      const description = `Usługa: ${formData.service}\nDodatkowo: ${formData.notes || ''}`
      formDataObj.append('description', description)
      formDataObj.append('selected_date', dateTime)
      
      formData.photos.forEach((photo) => {
        formDataObj.append('files', photo)
      })

      console.log('📦 Sending formData:')
      for (let [key, value] of formDataObj.entries()) {
        console.log(`  ${key}:`, value)
      }

      const apiBase = getApiUrl()
      const response = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Błąd przy tworzeniu zamówienia')
      }

      setSuccess(true)
      setFormData({
        phone: '',
        address: '',
        date: '',
        time: '',
        service: '',
        notes: '',
        photos: []
      })
      
      setTimeout(() => {
        closeModal()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Błąd przy wysyłaniu zamówienia')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>✕</button>
        
        {success ? (
          <div className="modal-success">
            <h2>✅ Zamówienie zostało przyjęte!</h2>
            <p>Wkrótce się z Tobą skontaktujemy.</p>
          </div>
        ) : (
          <>
            <h2>Złóż zamówienie</h2>
            <form onSubmit={handleSubmit}>
              {error && <div className="modal-error" style={{ padding: '12px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

              <div className="modal-field">
                <label>Numer telefonu *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>+48</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="574621560"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="9"
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label>Adres *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="np. Piłsudskiego 10, Warszawa"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Data wizyty *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Czas (opcjonalnie)</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-field">
                <label>Rodzaj usługi *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                >
                  <option value="">Wybierz usługę</option>
                  <option value="Naprawa">Naprawa</option>
                  <option value="Montaż">Montaż</option>
                  <option value="Prace remontowe">Prace remontowe</option>
                  <option value="Inne">Inne</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Dodatkowe informacje</label>
                <textarea
                  name="notes"
                  placeholder="Opisz co trzeba naprawić lub czego szukasz"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="modal-field">
                <label>Zdjęcia (max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {formData.photos.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Wybrane: {formData.photos.length} zdjęć
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2c5aa0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Wysyłanie...' : 'Wyślij zamówienie'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderModal
