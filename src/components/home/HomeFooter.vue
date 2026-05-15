<script setup lang="ts">
import type { HomePageData } from '../../types/home'

defineProps<{
  footer: HomePageData['footer']
}>()
</script>

<template>
  <footer class="home-footer">
    <div class="home-footer__inner">
      <p>{{ footer.copyright }}</p>

      <a
        v-if="footer.beian"
        class="home-footer__record"
        :href="footer.beian.href"
        target="_blank"
        rel="noreferrer"
      >
        {{ footer.beian.label }}
      </a>
    </div>
  </footer>
</template>

<style scoped>
.home-footer {
  margin-top: var(--space-2xl);
  padding-bottom: var(--space-lg);
}

.home-footer__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.home-footer__record {
  color: var(--color-accent);
}

@media (max-width: 720px) {
  .home-footer__inner {
    font-size: 0.84rem;
    text-align: center;
  }
}
</style>
