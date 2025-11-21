<template>
  <div class="public-layout">
    <CommonHeader />
    <main>
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import CommonHeader from '../CommonHeader.vue'
import AppFooter from '../common/AppFooter.vue'
</script>

<style scoped>
main { min-height: 60vh; }
</style>


