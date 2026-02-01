import { useState, useContext, useEffect } from 'react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import { getApiUrl } from '../utils/api-utils'
import './OrderModal.css'

function OrderModal() {
  const { isOpen, closeModal } = useContext(OrderModalContext)
  const [stage, setStage] = useState('form') // 'form' | 'verification' | 'success'
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [occupiedDates, setOccupiedDates] = useState([])
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
  
  // Отримуємо зайняті дати при відкритті модалю
  useEffect(() => {
    if (isOpen) {
      fetchOccupiedDates()
    }
  }, [isOpen])
  
  const fetchOccupiedDates = async () => {
    try {
      const apiBase = getApiUrl()
      console.log('🔗 API Base URL:', apiBase)
      const url = `${apiBase}/availability/check-dates`
      console.log('📍 Full URL:', url)
      const response = await fetch(url)
      console.log('✅ Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Occupied dates:', data)
        setOccupiedDates(data.occupied_dates || [])
      }
    } catch (err) {
      console.error('❌ Помилка при завантаженні зайнятих дат:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Видаляємо все, що не цифра
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

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('📤 Відправляємо SMS на номер:', '+48' + formData.phone)

    try {
      const phoneNumber = '+48' + formData.phone
      const apiBase = getApiUrl()
      console.log('📍 URL:', `${apiBase}/sms/send-code`)
      console.log('📍 Body:', JSON.stringify({ phone: phoneNumber }))
      
      const response = await fetch(`${apiBase}/sms/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      })

      console.log('✅ Відповідь статус:', response.status)
      const data = await response.json()
      console.log('✅ Відповідь дані:', data)

      if (!response.ok) {
        throw new Error('Błąd przy wysyłaniu kodu: ' + (data.detail || response.statusText))
      }

      console.log('✅ SMS код успішно відправлений!')
      setStage('verification')
    } catch (err) {
      console.error('❌ Pomyłka w wysyłaniu SMS:', err)
      setError('Nie udało się wysłać SMS. Błąd: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiBase = getApiUrl()
      const response = await fetch(`${apiBase}/sms/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: '+48' + formData.phone,
          code: verificationCode
        })
      })

      if (!response.ok) {
        throw new Error('Nieprawidłowy kod')
      }

      // Kod zweryfikowany, teraz wysyłamy zamówienie
      await submitOrder()
    } catch (err) {
      setError('Kod jest nieprawidłowy lub wygasł.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const submitOrder = async () => {
    try {
      // Перевіряємо, чи дата не зайнята
      if (occupiedDates.includes(formData.date)) {
        setError('Ten dzień jest już pełny. Wybierz inną datę.')
        return
      }
      
      const formDataObj = new FormData()
      formDataObj.append('phone', '+48' + formData.phone)
      formDataObj.append('address', formData.address)
      // Об'єднуємо дату й час та сервіс в опис
      const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}` : formData.date
      const description = `Услуга: ${formData.service}\nДодатково: ${formData.notes || ''}`
      formDataObj.append('description', description)
      formDataObj.append('selected_date', dateTime)
      
      formData.photos.forEach((photo) => {
        formDataObj.append('files', photo)
      })

      // Логування що відправляємо
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
        throw new Error('Błąd przy tworzeniu zamówienia')
      }

      setStage('success')
    } catch (err) {
      setError('Błąd przy wysyłaniu zamówienia.')
      console.error(err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>

        {/* ETAP 1: Formularz */}
        {stage === 'form' && (
          <>
            <h2>Zamów usługę</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="order-form" onSubmit={handleSendCode}>
              <label htmlFor="name">Imię</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />

              <label htmlFor="phone">Numer telefonu</label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+48</span>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  placeholder="123 456 789" 
                  maxLength="9"
                />
              </div>

              <label htmlFor="address">Adres</label>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                Nie musisz podawać dokładnego adresu – wystarczy osiedle, ulica lub miejsce orientacyjne
              </p>
              <input 
                type="text" 
                id="address" 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                required 
                placeholder="Np. osiedle, ulica, orientacja..."
              />

              <div className="form-row">
                <div className="form-col">
                  <label htmlFor="date">Data</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    value={formData.date}
                    onChange={handleChange}
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    style={occupiedDates.includes(formData.date) ? { borderColor: '#ff6b6b', backgroundColor: '#ffe0e0' } : {}}
                  />
                  {occupiedDates.includes(formData.date) && (
                    <p style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                      Ten dzień jest już pełny. Wybierz inną datę.
                    </p>
                  )}
                </div>
                <div className="form-col">
                  <label htmlFor="time">Godzina</label>
                  <input 
                    type="time" 
                    id="time" 
                    name="time" 
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

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
                <option value="elektryka">Elektryka</option>
                <option value="hydraulika">Hydraulika</option>
                <option value="wiercenie">Wiercenie</option>
                <option value="porządki">Porządki</option>
                <option value="inna">Inna</option>
              </select>

              <label htmlFor="notes">Co należy wykonać</label>
              <textarea 
                id="notes" 
                name="notes" 
                rows="3" 
                value={formData.notes}
                onChange={handleChange}
                placeholder="Opisz dokładnie co należy zrobić..."
                required
              />

              <label htmlFor="photos">
                Zdjęcia (do 5 sztuk)
                <span className="label-hint"> Zdjęcia pomogą nam zobaczyć problem i szybciej wykonać usługę</span>
              </label>
              <input 
                type="file" 
                id="photos" 
                name="photos" 
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {formData.photos.length > 0 ? (
                <div className="photos-preview">
                  <p className="photos-count">✓ Wybrano {formData.photos.length} zdjęć</p>
                  <div className="photos-list">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="photo-item">
                        {photo.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Brak wybranych zdjęć</p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? 'Wysyłanie kodu...' : 'Zamów'}
              </button>
            </form>
          </>
        )}

        {/* ETAP 2: Weryfikacja SMS */}
        {stage === 'verification' && (
          <>
            <h2>Weryfikacja SMS</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="order-form" onSubmit={handleVerifyCode}>
              <p className="verification-info">
                Kod weryfikacyjny został wysłany na numer {formData.phone}
              </p>
              
              <label htmlFor="code">Kod weryfikacyjny</label>
              <input 
                type="text" 
                id="code" 
                placeholder="Wpisz 6-cyfrowy kod"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
                required 
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Weryfikowanie...' : 'Potwierdź kod'}
              </button>
            </form>
          </>
        )}

        {/* ETAP 3: Sukces */}
        {stage === 'success' && (
          <div className="success-message">
            <h2>✓ Dziękujemy!</h2>
            <p>Twoje zamówienie zostało przyjęte. Skontaktujemy się wkrótce na numer {formData.phone}</p>
            <button 
              onClick={() => {
                closeModal()
                setStage('form')
                setFormData({ name: '', phone: '', date: '', service: '', notes: '', photos: [] })
                setVerificationCode('')
              }}
              className="order-form-btn"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderModal
