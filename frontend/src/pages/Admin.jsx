import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ordersApi } from '../services/api'
import './Admin.css'
import { Trash2 } from 'lucide-react'

function Admin() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    // Перевірка автентифікації
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      toast.error('Brak dostępu - wymagane zalogowanie')
      navigate('/login')
      return
    }
    
    fetchOrders()
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
          <p>Zarządzanie zamówieniami</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Wyloguj
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
