import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { datesApi } from '../services/api'
import './DatePicker.css'

function DatePicker({ selectedDate, onChange }) {
  const [availableDates, setAvailableDates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchAvailableDates()
  }, [])

  const fetchAvailableDates = async () => {
    setIsLoading(true)
    try {
      const response = await datesApi.getAvailable()
      setAvailableDates(response.data.map(d => d.date))
    } catch (error) {
      console.error('Error fetching dates:', error)
      toast.error('Nie udało się załadować dostępnych dat')
      // Generate some default dates for demo (next 14 days, excluding weekends)
      const defaultDates = generateDefaultDates()
      setAvailableDates(defaultDates)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDefaultDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(formatDate(date))
      }
      
      if (dates.length >= 14) break
    }
    
    return dates
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const isDateAvailable = (date) => {
    if (!date) return false
    const dateStr = formatDate(date)
    return availableDates.includes(dateStr)
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    return formatDate(date) === selectedDate
  }

  const isPastDate = (date) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleDateClick = (date) => {
    if (!date || !isDateAvailable(date) || isPastDate(date)) {
      return
    }
    onChange(formatDate(date))
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ]

  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

  if (isLoading) {
    return (
      <div className="date-picker loading">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Ładowanie dostępnych dat...</p>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="date-picker">
      <div className="calendar">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button
            type="button"
            className="nav-btn"
            onClick={previousMonth}
            aria-label="Poprzedni miesiąc"
          >
            ‹
          </button>
          <div className="month-year">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            type="button"
            className="nav-btn"
            onClick={nextMonth}
            aria-label="Następny miesiąc"
          >
            ›
          </button>
        </div>

        {/* Day Names */}
        <div className="day-names">
          {dayNames.map(day => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="calendar-days">
          {days.map((date, index) => {
            const available = isDateAvailable(date)
            const selected = isDateSelected(date)
            const past = isPastDate(date)
            
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${
                  available && !past ? 'available' : 'unavailable'
                } ${selected ? 'selected' : ''} ${past ? 'past' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date ? date.getDate() : ''}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Dostępne</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Wybrane</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>Niedostępne</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="selected-date-display">
          📅 Wybrana data: <strong>{selectedDate}</strong>
        </div>
      )}
    </div>
  )
}

export default DatePicker
