import { useState } from 'react'
import { toast } from 'react-toastify'
import { ordersApi } from '../services/api'
import PhotoUpload from './PhotoUpload'
import SMSVerification from './SMSVerification'
import DatePicker from './DatePicker'
import './OrderForm.css'

function OrderForm() {
  const [formData, setFormData] = useState({
    phone: '+48',
    address: '',
    description: '',
    selected_date: '',
    sms_code: '',
    photos: []
  })
  
  const [step, setStep] = useState(1) // 1: form, 2: SMS, 3: success
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSmsVerified, setIsSmsVerified] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePhotosChange = (photos) => {
    setFormData(prev => ({
      ...prev,
      photos
    }))
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      selected_date: date
    }))
    if (errors.selected_date) {
      setErrors(prev => ({
        ...prev,
        selected_date: ''
      }))
    }
  }

  const handleSmsVerified = (code) => {
    setIsSmsVerified(true)
    setFormData(prev => ({
      ...prev,
      sms_code: code
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Phone validation
    const phoneRegex = /^\+?[0-9]{9,15}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Numer telefonu jest wymagany'
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Nieprawidłowy format numeru telefonu'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Adres jest wymagany'
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Adres jest za krótki (min. 5 znaków)'
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Opis problemu jest wymagany'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Opis jest za krótki (min. 10 znaków)'
    }

    // Date validation
    if (!formData.selected_date) {
      newErrors.selected_date = 'Wybierz datę'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Proszę poprawić błędy w formularzu')
      return
    }

    if (!isSmsVerified) {
      toast.error('Proszę zweryfikować numer telefonu przez SMS')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await ordersApi.create(formData)
      
      toast.success('Zamówienie zostało złożone!')
      setStep(3) // Success step
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm()
      }, 3000)
      
    } catch (error) {
      console.error('Order submission error:', error)
      
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Wystąpił błąd. Spróbuj ponownie.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      phone: '+48',
      address: '',
      description: '',
      selected_date: '',
      sms_code: '',
      photos: []
    })
    setStep(1)
    setIsSmsVerified(false)
    setErrors({})
  }

  if (step === 3) {
    return (
      <div className="success-message">
        <div className="success-icon">✅</div>
        <h2>Zamówienie złożone!</h2>
        <p>Dziękujemy za złożenie zamówienia.</p>
        <p>Skontaktujemy się z Tobą wkrótce.</p>
        <button onClick={resetForm} className="btn btn-primary">
          Złóż kolejne zamówienie
        </button>
      </div>
    )
  }

  return (
    <div className="order-form-container">
      <h2>Formularz zamówienia</h2>
      <p className="form-subtitle">Wypełnij formularz, a my się z Tobą skontaktujemy</p>

      <form onSubmit={handleSubmit} className="order-form">
        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Numer telefonu *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="+48 123 456 789"
            disabled={isSmsVerified}
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>

        {/* SMS Verification */}
        {formData.phone && !isSmsVerified && (
          <SMSVerification
            phoneNumber={formData.phone}
            onVerified={handleSmsVerified}
          />
        )}

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address" className="form-label">
            Adres *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`form-input ${errors.address ? 'error' : ''}`}
            placeholder="ul. Przykładowa 123, Legionowo"
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Opis problemu *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Opisz szczegółowo problem, który wymaga naprawy..."
            rows={5}
          />
          {errors.description && <p className="error-message">{errors.description}</p>}
          <small className="form-hint">
            Min. 10 znaków. Bądź jak najbardziej szczegółowy.
          </small>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label">
            Zdjęcia (opcjonalnie)
          </label>
          <PhotoUpload
            photos={formData.photos}
            onChange={handlePhotosChange}
          />
          <small className="form-hint">
            Możesz dodać do 5 zdjęć (max 5MB każde)
          </small>
        </div>

        {/* Date Picker */}
        <div className="form-group">
          <label className="form-label">
            Wybierz datę *
          </label>
          <DatePicker
            selectedDate={formData.selected_date}
            onChange={handleDateChange}
          />
          {errors.selected_date && (
            <p className="error-message">{errors.selected_date}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={!isSmsVerified || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Wysyłanie...
              </>
            ) : (
              'Złóż zamówienie'
            )}
          </button>
        </div>

        {!isSmsVerified && (
          <p className="form-info">
            ℹ️ Najpierw zweryfikuj numer telefonu przez SMS
          </p>
        )}
      </form>
    </div>
  )
}

export default OrderForm