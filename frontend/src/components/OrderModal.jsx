import { useState, useContext } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import { getApiUrl } from '../utils/api-utils'
import './OrderModal.css'

// Version: 1.1.0 - Updated UI with improved form layout

function OrderModal() {
  const { isOpen, closeModal } = useContext(OrderModalContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
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
      if (!formData.name || formData.name.length < 2) {
        throw new Error('Podaj swoje imię')
      }
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
      const description = `Imię: ${formData.name}\nUsługa: ${formData.service}\nDodatkowo: ${formData.notes || ''}`
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
        name: '',
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
        <div className="modal-header">
          <h2>🔧 Zamów złotą rączkę</h2>
          <p>Podaj kilka informacji – oddzwonimy</p>
        </div>

        {success ? (
          <div className="modal-success">
            <h2>✅ Zamówienie zostało przyjęte!</h2>
            <p>Wkrótce się z Tobą skontaktujemy.</p>
          </div>
        ) : (
          <form className="order-form" onSubmit={handleSubmit}>
            {error && <div className="modal-error">{error}</div>}

            <label>� Imię</label>
            <input
              type="text"
              name="name"
              placeholder="Np. Jan Kowalski"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>�📞 Telefon</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+48</span>
              <input
                type="tel"
                name="phone"
                placeholder="Np. 574 621 560"
                value={formData.phone}
                onChange={handleChange}
                maxLength="9"
                required
              />
            </div>

            <label>📍 Adres</label>
            <input
              type="text"
              name="address"
              placeholder="Np. Piłsudskiego 10, Warszawa"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <label> Opisz problem</label>
            <textarea
              name="notes"
              placeholder="Np. cieknący kran w kuchni"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            ></textarea>
            <label>🔧 Jakiej usługi potrzebujesz?</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Wybierz usługę</option>
              <option value="Montaż mebli">Montaż mebli</option>
              <option value="Hydraulika">Hydraulika</option>
              <option value="Elektryka">Elektryka</option>
              <option value="Naprawy domowe">Naprawy domowe</option>
              <option value="Sprzątanie domu">Sprzątanie domu</option>
              <option value="Inne">Inne</option>
            </select>
            <div className="row">
              <div>
                <label>📅 Data</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>⏰ Godzina (opcjonalnie)</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>📷 Dodaj zdjęcie (opcjonalnie)</label>
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

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Wysyłanie...' : 'Zamów fachowca'}
            </button>

            <span className="info">⏱ Odpowiadamy w ciągu dnia</span>
          </form>
        )}
      </div>
    </div>
  )
}

export default OrderModal
