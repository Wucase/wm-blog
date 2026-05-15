<script setup lang="ts">
import type { HomePageData } from '../../types/home'

defineProps<{
  about: HomePageData['about']
}>()
</script>

<template>
  <section id="about" class="about-panel reveal-on-scroll" v-reveal="0">
    <div class="about-panel__copy">
      <p>{{ about.eyebrow }}</p>
      <h2>{{ about.title }}</h2>
      <p class="about-panel__text">{{ about.description }}</p>
    </div>

    <div class="about-panel__stack">
      <article
        v-for="(card, index) in about.cards"
        :key="card.label"
        v-reveal="160 + index * 110"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>
  </section>
</template>

<style scoped>
.about-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
  gap: var(--space-xl);
  margin-top: var(--space-2xl);
  padding: var(--space-2xl);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at top right, rgba(115, 216, 231, 0.14), transparent 30%),
    linear-gradient(140deg, rgba(12, 23, 36, 0.88), rgba(12, 23, 36, 0.78));
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.about-panel::after {
  content: '';
  position: absolute;
  inset: auto -8% -24% auto;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 179, 91, 0.12), transparent 72%);
  filter: blur(6px);
  animation: pulseOrb 8s ease-in-out infinite;
  pointer-events: none;
}

.about-panel__copy > p:first-child,
.about-panel__stack span {
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.about-panel__copy h2 {
  margin: var(--space-sm) 0 var(--space-md);
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: clamp(2.3rem, 4vw, 3.5rem);
  line-height: 1;
}

.about-panel__text {
  color: var(--color-text-secondary);
  line-height: 1.9;
}

.about-panel__stack {
  display: grid;
  gap: var(--space-md);
}

.about-panel__stack article {
  display: grid;
  gap: var(--space-xs);
  padding: var(--space-lg);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(245, 241, 232, 0.08);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--motion-base) ease,
    border-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.about-panel__stack article:hover {
  transform: translateY(-6px);
  border-color: rgba(240, 179, 91, 0.2);
  box-shadow: 0 22px 42px rgba(0, 0, 0, 0.24);
}

.about-panel__stack strong {
  color: var(--color-primary-deep);
  font-size: var(--font-size-lg);
  line-height: 1.6;
}

@keyframes pulseOrb {
  0%,
  100% {
    transform: scale(0.94);
    opacity: 0.48;
  }

  50% {
    transform: scale(1.08);
    opacity: 0.9;
  }
}

@media (max-width: 900px) {
  .about-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .about-panel {
    padding: var(--space-lg);
  }

  .about-panel__copy h2 {
    font-size: 1.8rem;
  }

  .about-panel__stack strong {
    font-size: 1rem;
    line-height: 1.7;
  }
}
</style>
