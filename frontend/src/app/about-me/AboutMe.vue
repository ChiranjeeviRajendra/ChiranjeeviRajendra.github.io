<script setup>
import { ref, useId } from 'vue'

const id = useId()
const activeTab = ref(0)
const tabs = ['Formal Info', 'Informal Info']
const formalInfo = [
  ['Name:', 'Chiranjeevi'],
  ['Gender:', 'Male'],
  ['DOB:', '12-10-1993'],
  ['Marital status:', 'Single'],
  ["Father's Name:", 'Rajendra K'],
  ["Mother's Name:", 'Rajeshwari R'],
  ['Residing Place:', 'Mysore'],
  ['Nationality:', 'Indian'],
]

function handleTabKey(event, index) {
  let target
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') target = 1 - index
  if (event.key === 'Home') target = 0
  if (event.key === 'End') target = tabs.length - 1
  if (target === undefined) return
  event.preventDefault()
  activeTab.value = target
  document.getElementById(`${id}-tab-${target}`).focus()
}
</script>

<template>
  <section aria-label="Personal Details">
    <div class="tabs" role="tablist" aria-label="Personal information">
      <button
        v-for="(tab, index) in tabs"
        :id="`${id}-tab-${index}`"
        :key="tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === index"
        :aria-controls="`${id}-panel-${index}`"
        :tabindex="activeTab === index ? 0 : -1"
        @click="activeTab = index"
        @keydown="handleTabKey($event, index)"
      >{{ tab }}</button>
    </div>
    <div :id="`${id}-panel-0`" :hidden="activeTab !== 0" role="tabpanel" :aria-labelledby="`${id}-tab-0`" tabindex="0">
      <dl class="formal-info">
        <div v-for="[label, value] in formalInfo" :key="label" class="card">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </div>
    <div :id="`${id}-panel-1`" :hidden="activeTab !== 1" role="tabpanel" :aria-labelledby="`${id}-tab-1`" class="card informal-info" tabindex="0">
      <strong>Hobbies</strong>
      <ul class="content-list">
        <li>Playing video games</li>
        <li>Travelling</li>
        <li>Learning new things</li>
      </ul>
      <hr>
      <strong>etc</strong>
      <ul class="content-list"><li v-for="item in 5" :key="item">etc</li></ul>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--portfolio-border);
  margin-bottom: 16px;
}

.tabs button {
  min-height: 48px;
  padding: 10px 20px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--portfolio-text);
}

.tabs button[aria-selected="true"] {
  border-bottom-color: var(--portfolio-accent);
  color: var(--portfolio-accent);
  font-weight: 600;
}

.formal-info {
  display: grid;
  gap: 12px;
  margin: 0;
}

.formal-info .card {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

dt {
  font-weight: 600;
}

dd {
  margin: 0;
}

.informal-info .content-list {
  margin-top: 12px;
}
</style>
