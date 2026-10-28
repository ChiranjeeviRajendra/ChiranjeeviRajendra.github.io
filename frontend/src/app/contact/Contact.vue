<script setup>
import { assetUrl } from '../shared/assets'

const contacts = [
  { label: 'Call', href: 'tel:+917899782057', image: 'logo1.png', accessibleLabel: 'Call Chiranjeevi' },
  { label: 'Github', href: 'https://github.com/ChiranjeeviRajendra', image: 'github-logo.png', accessibleLabel: 'Chiranjeevi on Github' },
  { label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=+917899782057', image: 'logo4.jpg', accessibleLabel: 'Message Chiranjeevi on WhatsApp' },
  { label: 'Mail', href: 'mailto:crjirja@gmail.com', image: 'logo2.png', accessibleLabel: 'Email Chiranjeevi' },
]
</script>

<template>
  <section aria-label="Contact">
    <div class="card contact-intro">
      <p class="text-lead">I would love to talk to you about any new projects you may have or
        any of the services that I offer</p>
      <p class="text-lead">You are one click away from connecting with a great developer</p>
    </div>
    <h2 class="contact-heading">Contact me via</h2>
    <ul class="contact-list">
      <li v-for="contact in contacts" :key="contact.label">
        <a :href="contact.href" :aria-label="contact.accessibleLabel">
          <strong>{{ contact.label }}</strong>
          <img :src="assetUrl(contact.image)" alt="" width="50" height="50" loading="lazy" decoding="async">
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.contact-intro p + p {
  text-align: center;
}

.contact-heading {
  text-align: center;
  margin-top: 42px;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-list li {
  border-top: 1px solid var(--portfolio-accent);
}

.contact-list li:last-child {
  border-bottom: 1px solid var(--portfolio-accent);
}

.contact-list a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
}

.contact-list a:hover {
  background: var(--portfolio-soft);
}

.contact-list img {
  object-fit: contain;
}
</style>
