import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ordersApi, datesApi } from '../services/api'
import './Admin.css'
import { Trash2 } from 'lucide-react'

function Admin() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')
  const [dates, setDates] = useState([])
  const [newDateInput, setNewDateInput] = useState('')

  useEffect(() => {
    // Перевірка автентифікації
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      toast.error('Brak dostępu - wymagane zalogowanie')
      navigate('/login')
      return
    }
    
    fetchOrders()
    fetchDates()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await ordersApi.getAll()
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Nie udało się załadować zamówienia')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDates = async () => {
    try {
      const response = await datesApi.getAll()
      setDates(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching dates:', error)
      toast.error('Nie udało się załadować daty')
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      toast.success('Status zamówienia zaktualizowany')
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Nie udało się zaktualizować status')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zamówienie?')) {
      return
    }

    try {
      await ordersApi.delete(orderId)
      toast.success('Zamówienie zostało usunięte')
      setOrders(orders.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Nie udało się usunąć zamówienia')
    }
  }

  const handleAddDate = async () => {
    if (!newDateInput.trim()) {
      toast.error('Proszę podać datę')
      return
    }

    try {
      const response = await datesApi.create({ date: newDateInput })
      toast.success('Data została dodana')
      setNewDateInput('')
      setDates([...dates, response.data])
    } catch (error) {
      console.error('Error adding date:', error)
      toast.error('Nie udało się dodać datę')
    }
  }

  const handleDeleteDate = async (dateId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę datę?')) {
      return
    }

    try {
      await datesApi.delete(dateId)
      toast.success('Data została usunięta')
      setDates(dates.filter(d => d.id !== dateId))
    } catch (error) {
      console.error('Error deleting date:', error)
      toast.error('Nie udało się usunąć datę')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      new: '#3b82f6',
      in_progress: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    toast.info('Wylogowany')
    navigate('/login')
  }

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nowe',
      in_progress: 'W trakcie',
      completed: 'Zakończone',
      cancelled: 'Anulowane'
    }
    return labels[status] || status
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Ładowanie zamówień...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Panel administracyjny</h1>
          <p>Zarządzanie zamówieniami i datami</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Wyloguj
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Zamówienia ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'dates' ? 'active' : ''}`}
          onClick={() => setActiveTab('dates')}
        >
          📅 Dostępne daty ({dates.length})
        </button>
      </div>

      <div className="admin-content">
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
            {/* Filters */}
            <div className="admin-filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Wszystkie ({orders.length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
                onClick={() => setFilterStatus('new')}
              >
                Nowe ({orders.filter(o => o.status === 'new').length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'in_progress' ? 'active' : ''}`}
                onClick={() => setFilterStatus('in_progress')}
              >
                W trakcie ({orders.filter(o => o.status === 'in_progress').length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Zakończone ({orders.filter(o => o.status === 'completed').length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilterStatus('cancelled')}
              >
                Anulowane ({orders.filter(o => o.status === 'cancelled').length})
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="no-orders">
                <p>Brak zamówień</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Zamówienie #{order.id}</div>
                      <div 
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </div>
                    </div>

                    <div className="order-info">
                      <div className="info-row">
                        <strong>💱 Telefon:</strong> {order.phone}
                      </div>
                      <div className="info-row">
                        <strong>📍 Adres:</strong> {order.address}
                      </div>
                      <div className="info-row">
                        <strong>📅 Data:</strong> {order.selected_date}
                      </div>
                      <div className="info-row">
                        <strong>📏 Opis:</strong> {order.description}
                      </div>
                      {order.photos && order.photos.length > 0 && (
                        <div className="info-row">
                          <strong>💸 Zdjęcia:</strong> {order.photos.length} szt.
                          <button
                            className="view-photos-btn"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Przegląd
                          </button>
                        </div>
                      )}
                      <div className="info-row">
                        <strong>🗒 Utworzono:</strong> {new Date(order.created_at).toLocaleString('pl-PL')}
                      </div>
                    </div>

                    <div className="order-actions">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">Nowe</option>
                        <option value="in_progress">W trakcie</option>
                        <option value="completed">Zakończone</option>
                        <option value="cancelled">Anulowane</option>
                      </select>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Usuń zamówienie"
                      >
                        <Trash2 size={18} /> Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DATES TAB */}
        {activeTab === 'dates' && (
          <>
            <div className="dates-container">
              <div className="add-date-form">
                <h3>Dodaj nową dostępną datę</h3>
                <div className="form-group">
                  <input
                    type="date"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    className="date-input"
                  />
                  <button
                    onClick={handleAddDate}
                    className="add-date-btn"
                  >
                    Dodaj datę
                  </button>
                </div>
              </div>

              <div className="dates-list">
                <h3>Dostępne daty</h3>
                {dates.length === 0 ? (
                  <p className="no-dates">Brak dostępnych dat</p>
                ) : (
                  <div className="dates-grid">
                    {dates.map(date => (
                      <div key={date.id} className="date-card">
                        <div className="date-display">
                          <span className="date-text">
                            {new Date(date.date).toLocaleDateString('pl-PL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {date.is_booked && (
                            <span className="date-status booked">Zarezerwowana</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDate(date.id)}
                          className="delete-date-btn"
                          title="Usuń datę"
                        >
                          <Trash2 size={18} /> Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Photo Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
            <h2>Zdjęcia - Zamówienie #{selectedOrder.id}</h2>
            <div className="modal-photos">
              {Array.isArray(selectedOrder.photos) ? (
                selectedOrder.photos.map((photo, index) => {
                  const photoUrl = typeof photo === 'string' 
                    ? `http://127.0.0.1:8000/uploads/photos/${photo}`
                    : `http://127.0.0.1:8000/uploads/photos/${photo.filename || photo}`;
                  
                  return (
                    <div key={index} className="modal-photo">
                      <img
                        src={photoUrl}
                        alt={`Zdjęcie ${index + 1}`}
                        onError={(e) => {
                          console.error('Image failed to load:', photoUrl);
                          e.target.src = '/uploads/placeholder.png';
                        }}
                      />
                      <p>Zdjęcie {index + 1}</p>
                    </div>
                  );
                })
              ) : (
                <p>Brak zdjęć</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
