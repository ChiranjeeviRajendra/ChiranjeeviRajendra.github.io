<script setup>
import Disclosure from '../shared/Disclosure.vue'
import { skillGroups } from './skills.data'
</script>

<template>
  <section aria-label="Skills" class="content-accordion">
    <Disclosure v-for="group in skillGroups" :key="group.title" :title="group.title">
      <div class="content-accordion">
        <Disclosure v-for="skill in group.skills" :key="skill.title" :title="skill.title">
          <ul class="content-list">
            <li v-for="detail in skill.details" :key="detail">{{ detail }}</li>
          </ul>
        </Disclosure>
      </div>
    </Disclosure>
  </section>
</template>
