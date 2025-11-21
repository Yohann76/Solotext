<template>
  <div class="public-layout">
    <CommonHeader />
    <main>
      <router-view />
    </main>
    <AppFooter />
    
    <!-- Notifications -->
    <div class="notifications-container">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :message="notification.message"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script setup>
import CommonHeader from '../CommonHeader.vue'
import AppFooter from '../common/AppFooter.vue'
import Notification from '../Notification.vue'
import { useNotifications } from '../../composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
main { min-height: 60vh; }

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>


