<script setup>
import { defineAsyncComponent, useId } from 'vue'
import { sectionComponents } from '../app.routes'
import Disclosure from '../shared/Disclosure.vue'

const group = useId()
const sections = [
  ['My Personal Details', 'personalDetails'],
  ['My Skills', 'skills'],
  ['My Experience', 'experience'],
  ['My Projects', 'projects'],
  ['Education', 'education'],
  ['Contact Me', 'contact'],
].map(([title, key]) => ({ title, component: defineAsyncComponent(sectionComponents[key]) }))
</script>

<template>
  <div class="home">
    <section class="card welcome">
      <h1>Welcome To My Portfolio</h1>
      <p>Hi! This is Chiranjeevi, a Senior Software Engineer, not by destiny but by passion</p>
      <p>This website is designed and built by me to showcase my passion
        for learning technologies and also to endorse the digitalisation era</p>
    </section>
    <div class="content-accordion home-sections">
      <Disclosure v-for="section in sections" :key="section.title" :title="section.title" :group="group">
        <component :is="section.component" />
      </Disclosure>
    </div>
    <footer class="card farewell">
      <p>Thank you so much</p>
      <p>for taking a tour in my portfolio web app</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  gap: 16px;
}

.welcome, .farewell {
  background: var(--portfolio-accent);
  color: #fff;
  text-align: center;
  padding: 24px 16px;
}
</style>
