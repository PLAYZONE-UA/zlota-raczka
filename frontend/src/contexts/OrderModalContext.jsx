import { createContext, useState, useContext } from 'react'

export const OrderModalContext = createContext()

export function OrderModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <OrderModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </OrderModalContext.Provider>
  )
}

export function useOrderModal() {
  const context = useContext(OrderModalContext)
  if (!context) {
    throw new Error('useOrderModal must be used within OrderModalProvider')
  }
  return context
}
