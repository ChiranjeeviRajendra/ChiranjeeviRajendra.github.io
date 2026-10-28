<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { assetUrl } from '../shared/assets'

const slides = [
  { image: 'cara1.png', caption: 'Mastered the HTML and its structuring' },
  { image: 'cara2.jpg', caption: 'Excellence in OOPs concepts' },
  { image: 'cara3.jpg', caption: 'Deep understanding in GIT' },
  { image: 'cara4.jpg', caption: 'Expertise in NPM' },
  { image: 'cara5.jpg', caption: 'Proficiency in building Angular SPA' },
  { image: 'cara6.png', caption: 'Proficiency BOM & DOM manipulation' },
]

const index = ref(0)
const paused = ref(false)
const hovered = ref(false)
const focused = ref(false)
const interacting = computed(() => hovered.value || focused.value)
const hidden = ref(false)
const reducedMotion = ref(false)
const slide = computed(() => slides[index.value])
let timer
let motionQuery

function move(direction) {
  index.value = (index.value + direction + slides.length) % slides.length
  updateTimer()
}

function updateTimer() {
  clearInterval(timer)
  if (!paused.value && !interacting.value && !hidden.value && !reducedMotion.value) {
    timer = setInterval(() => move(1), 3200)
  }
}

function updateVisibility() {
  hidden.value = document.hidden
}

function updateMotion() {
  reducedMotion.value = motionQuery.matches
}

function handleFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) focused.value = false
}

watch([paused, interacting, hidden, reducedMotion], updateTimer)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotion()
  updateVisibility()
  motionQuery.addEventListener('change', updateMotion)
  document.addEventListener('visibilitychange', updateVisibility)
  updateTimer()
})

onBeforeUnmount(() => {
  clearInterval(timer)
  motionQuery?.removeEventListener('change', updateMotion)
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<template>
  <section
    class="carousel"
    role="region"
    aria-roledescription="carousel"
    aria-label="Development skills"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="handleFocusOut"
    @keydown.left.prevent="move(-1)"
    @keydown.right.prevent="move(1)"
  >
    <div role="group" aria-roledescription="slide" :aria-label="`${index + 1} of ${slides.length}`" :aria-live="paused || interacting || reducedMotion ? 'polite' : 'off'">
      <img :src="assetUrl(slide.image)" :alt="slide.caption" width="960" height="310" decoding="async" fetchpriority="high">
      <p class="caption">{{ slide.caption }}</p>
    </div>
    <button type="button" class="carousel-arrow previous" aria-label="Previous" @click="move(-1)">‹</button>
    <button type="button" class="carousel-arrow next" aria-label="Next" @click="move(1)">›</button>
    <button type="button" class="rotation-toggle" :aria-label="paused ? 'Play slideshow' : 'Pause slideshow'" :aria-pressed="paused" @click="paused = !paused">
      {{ paused ? 'Play' : 'Pause' }}
    </button>
  </section>
</template>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  background: var(--portfolio-accent);
  color: #fff;
  border-radius: var(--portfolio-radius);
}

.carousel img {
  display: block;
  width: 100%;
  height: clamp(210px, 30vw, 310px);
  object-fit: contain;
  background: #fff;
}

.caption {
  margin: 0;
  padding: 14px 64px;
  text-align: center;
  min-height: 62px;
}

.carousel-arrow {
  position: absolute;
  top: 36%;
  display: grid;
  place-items: center;
  width: 44px;
  height: 48px;
  border: 0;
  border-radius: 4px;
  background: #15156bd9;
  color: #fff;
  font: 2rem/1 sans-serif;
}

.previous {
  left: 8px;
}

.next {
  right: 8px;
}

.rotation-toggle {
  position: absolute;
  bottom: 8px;
  right: 8px;
  min-height: 44px;
  padding: 4px 8px;
  border: 1px solid #ffffff80;
  border-radius: 4px;
  background: var(--portfolio-accent);
  color: #fff;
  font-size: .8rem;
}

.carousel button:focus-visible {
  outline-color: #ffce61;
  outline-offset: -3px;
}

@media (max-width: 400px) {
  .caption {
    font-size: .875rem;
    padding-left: 8px;
    padding-right: 68px;
  }
}
</style>
