<template>
  <div v-if="visible" class="notification" :class="typeClass">
    <div class="notification-content">
      <span class="notification-icon">{{ icon }}</span>
      <span class="notification-message">{{ message }}</span>
      <button @click="close" class="notification-close">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Notification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const visible = ref(true)
    let timeoutId = null

    const typeClass = computed(() => `notification-${props.type}`)

    const icon = computed(() => {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      return icons[props.type] || icons.info
    })

    const close = () => {
      visible.value = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    onMounted(() => {
      if (props.autoClose) {
        timeoutId = setTimeout(() => {
          close()
        }, props.duration)
      }
    })

    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    return {
      visible,
      typeClass,
      icon,
      close
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-weight: 500;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  opacity: 1;
}

/* Types de notifications */
.notification-success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.notification-warning {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.notification-info {
  background: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification.closing {
  animation: slideOut 0.3s ease-in forwards;
}
</style>
