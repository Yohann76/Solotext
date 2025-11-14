import { ref, reactive } from 'vue'

// État global des notifications
const notifications = ref([])
let nextId = 1

export function useNotifications() {
  const addNotification = (message, type = 'info', options = {}) => {
    const notification = {
      id: nextId++,
      message,
      type,
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false
    }
    
    notifications.value.push(notification)
    
    // Auto-suppression si activée
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
    
    return notification.id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Méthodes de convenance
  const success = (message, options = {}) => {
    return addNotification(message, 'success', { duration: 4000, ...options })
  }

  const error = (message, options = {}) => {
    return addNotification(message, 'error', { duration: 6000, ...options })
  }

  const warning = (message, options = {}) => {
    return addNotification(message, 'warning', { duration: 5000, ...options })
  }

  const info = (message, options = {}) => {
    return addNotification(message, 'info', { duration: 4000, ...options })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
