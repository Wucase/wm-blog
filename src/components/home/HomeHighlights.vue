<script setup lang="ts">
import type { HomePageData } from '../../types/home'

defineProps<{
  metrics: HomePageData['highlightMetrics']
  sections: HomePageData['entrySections']
}>()
</script>

<template>
  <section class="highlights">
    <div class="metrics-panel">
      <div
        v-for="(metric, index) in metrics"
        :key="metric.label"
        class="metric-card"
        v-reveal="index * 90"
      >
        <strong>{{ metric.value }}</strong>
        <h3>{{ metric.label }}</h3>
        <p>{{ metric.description }}</p>
      </div>
    </div>

    <div class="entry-panel">
      <article
        v-for="(section, index) in sections"
        :key="section.index"
        class="entry-card"
        v-reveal="180 + index * 110"
      >
        <span>{{ section.index }}</span>
        <h3>{{ section.title }}</h3>
        <p>{{ section.description }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.highlights {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-xl);
  margin-top: var(--space-xl);
}

.metrics-panel,
.entry-panel {
  display: grid;
  gap: var(--space-lg);
}

.metrics-panel {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card,
.entry-card {
  position: relative;
  padding: var(--space-xl);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-2xl);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.02)),
    rgba(16, 28, 44, 0.82);
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  transition:
    transform var(--motion-base) ease,
    border-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.metric-card::before,
.entry-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(240, 179, 91, 0.12), transparent 46%);
  pointer-events: none;
}

.metric-card:hover,
.entry-card:hover {
  transform: translateY(-8px);
  border-color: rgba(240, 179, 91, 0.24);
  box-shadow: 0 28px 54px rgba(0, 0, 0, 0.28);
}

.metric-card strong {
  display: block;
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
}

.metric-card h3,
.entry-card h3 {
  margin: var(--space-sm) 0 var(--space-xs);
  color: var(--color-text-strong);
  font-size: var(--font-size-xl);
}

.metric-card p,
.entry-card p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.entry-card span {
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.22em;
}

@media (max-width: 960px) {
  .highlights,
  .metrics-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .highlights {
    gap: var(--space-lg);
  }

  .metric-card,
  .entry-card {
    padding: var(--space-lg);
  }

  .metric-card h3,
  .entry-card h3 {
    font-size: 1.15rem;
  }

  .metric-card p,
  .entry-card p {
    line-height: 1.7;
  }
}
</style>
