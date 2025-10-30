<template>
  <header class="header" :class="{ scrolled: hasScrolled }">
    <NavBar />
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from './navigation/NavBar.vue'

export default {
  name: 'CommonHeader',
  components: {
    NavBar
  },
  setup() {
    const hasScrolled = ref(false)

    const onKeydown = (e) => {
      // nav mobile géré dans NavBar
    }

    const onScroll = () => {
      hasScrolled.value = window.scrollY > 8
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeydown)
      window.addEventListener('scroll', onScroll, { passive: true })
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('scroll', onScroll)
    })

    return {
      hasScrolled,
      
    }
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  /* background: var(--gradient-section); */
  background-color: #32c4c0 ;
  color: #ffffff;
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.08); */
  transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.header.scrolled {
  /* background: linear-gradient(235.37deg, rgba(7,42,37,0.98) 0%, rgba(3,24,21,0.98) 28%, rgba(7,42,37,0.98) 100%); */
  background-color: #32c4c0 ;
  box-shadow: 0 12px 24px rgba(0,0,0,0.25);
  border-color: rgba(255,255,255,0.12);
}
</style>
