<template>
  <div id="app">
    <CommonHeader />
    <router-view />
  </div>
</template>

<script>
import CommonHeader from './components/CommonHeader.vue'

export default {
  name: 'App',
  components: { CommonHeader }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
