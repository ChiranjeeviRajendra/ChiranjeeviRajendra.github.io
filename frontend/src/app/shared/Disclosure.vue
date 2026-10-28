<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  group: { type: String, default: undefined },
})

const hasOpened = ref(false)

function handleToggle(event) {
  if (event.target.open) hasOpened.value = true
}
</script>

<template>
  <details class="disclosure" :name="group" @toggle="handleToggle">
    <summary>{{ title }}</summary>
    <!-- Mount on first opening, then retain nested tabs and expansion state. -->
    <div v-if="hasOpened" class="disclosure-body"><slot /></div>
  </details>
</template>
