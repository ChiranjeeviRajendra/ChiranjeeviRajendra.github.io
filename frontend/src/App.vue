<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigation } from './app/app.routes'
import { assetUrl } from './app/shared/assets'
import './app/app.css'

const route = useRoute()
const menuOpen = ref(false)
const menuButton = ref(null)
const sidebar = ref(null)
const main = ref(null)
let mobileQuery

function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) menuButton.value?.focus()
}

function handleResize() {
  if (!mobileQuery.matches) closeMenu()
}

function handleKeydown(event) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
  }
  if (event.key === 'Tab') {
    const links = sidebar.value.querySelectorAll('a')
    const first = links[0]
    const last = links[links.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      menuButton.value.focus()
    } else if (event.shiftKey && document.activeElement === menuButton.value) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      menuButton.value.focus()
    }
  }
}

watch(menuOpen, async (open) => {
  document.body.classList.toggle('navigation-open', open)
  if (open) {
    await nextTick()
    sidebar.value.querySelector('a[aria-current="page"], a')?.focus()
  }
})

watch(() => route.fullPath, async () => {
  closeMenu()
  await nextTick()
  main.value?.focus({ preventScroll: true })
})

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 700px)')
  mobileQuery.addEventListener('change', handleResize)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', handleResize)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('navigation-open')
})
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="main?.focus()">Skip to content</a>
  <header class="toolbar">
    <button
      ref="menuButton"
      class="menu-toggle"
      type="button"
      aria-controls="portfolio-navigation"
      :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
      :aria-expanded="menuOpen"
      @click="menuOpen = !menuOpen"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path v-if="menuOpen" d="m6 6 12 12M6 18 18 6" />
        <path v-else d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
    <RouterLink class="brand" to="/home" :inert="menuOpen">Chiranjeevi</RouterLink>
  </header>

  <div class="app-layout">
    <div v-if="menuOpen" class="navigation-backdrop" aria-hidden="true" @click="closeMenu(true)"></div>
    <aside id="portfolio-navigation" ref="sidebar" class="sidebar" :class="{ 'is-open': menuOpen }">
      <div class="profile">
        <img :src="assetUrl('banner2.jpg')" alt="Chiranjeevi" width="130" height="130">
        <h2>Chiranjeevi</h2>
        <p>Software Engineer</p>
      </div>
      <nav aria-label="Main navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :class="{ 'is-active': route.path === item.path || (item.path === '/home' && route.path === '/') }"
          :aria-current="route.path === item.path || (item.path === '/home' && route.path === '/') ? 'page' : undefined"
          @click="closeMenu()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <main id="main-content" ref="main" class="content" tabindex="-1" :inert="menuOpen">
      <RouterView />
    </main>
  </div>
</template>

