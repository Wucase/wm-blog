<script setup lang="ts">
import type { PublicBlogPageData } from '../../types/blog'

defineProps<{
  featured: PublicBlogPageData['featured']
}>()
</script>

<template>
  <section class="blog-featured reveal-on-scroll" v-reveal="{ delay: 0, y: 28 }">
    <div class="blog-featured__content">
      <p class="blog-featured__eyebrow">Editor's Pick</p>
      <a :href="`/wm/blog/${featured.id}`" class="blog-featured__title-link">
        <h2>{{ featured.title }}</h2>
      </a>
      <p class="blog-featured__summary">{{ featured.summary }}</p>

      <div class="blog-featured__meta">
        <span>{{ featured.category }}</span>
        <span>{{ featured.publishDate }}</span>
        <span>{{ featured.readTime }}</span>
      </div>

      <div class="blog-featured__author">
        <span class="blog-featured__avatar">{{ featured.author.avatarText }}</span>
        <div>
          <strong>{{ featured.author.name }}</strong>
          <small>{{ featured.author.role }}</small>
        </div>
      </div>
    </div>

    <div class="blog-featured__visual">
      <img :src="featured.image" :alt="featured.title" />
    </div>
  </section>
</template>

<style scoped>
.blog-featured {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(20rem, 1.05fr);
  gap: var(--space-xl);
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  border: 1px solid var(--color-border-soft);
  background:
    radial-gradient(circle at top right, rgba(240, 179, 91, 0.1), transparent 28%),
    rgba(12, 23, 36, 0.84);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.blog-featured::after {
  content: '';
  position: absolute;
  inset: -24% auto auto -22%;
  width: 34%;
  height: 180%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transform: rotate(14deg);
  animation: sweepGlow 11s ease-in-out infinite;
  pointer-events: none;
}

.blog-featured__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.blog-featured h2 {
  margin: var(--space-sm) 0 var(--space-md);
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: clamp(2.4rem, 5vw, 3.7rem);
  line-height: 1;
}

.blog-featured__title-link {
  display: inline-block;
  position: relative;
}

.blog-featured__summary {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.9;
}

.blog-featured__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: var(--space-lg);
}

.blog-featured__meta span {
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-secondary);
  font-size: 0.92rem;
}

.blog-featured__author {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: var(--space-lg);
}

.blog-featured__avatar {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(247, 193, 70, 0.92), rgba(214, 142, 52, 1));
  color: var(--color-primary-deep);
  font-weight: 800;
}

.blog-featured__author strong {
  display: block;
  color: var(--color-text-strong);
}

.blog-featured__author small {
  color: var(--color-text-secondary);
}

.blog-featured__visual img {
  width: 100%;
  height: 100%;
  min-height: 22rem;
  object-fit: cover;
  border-radius: calc(var(--radius-2xl) + 0.25rem);
  box-shadow: var(--shadow-card);
  transition:
    transform 900ms ease,
    filter 600ms ease;
}

.blog-featured:hover .blog-featured__visual img {
  transform: scale(1.05);
  filter: saturate(1.08);
}

.blog-featured__title-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.3rem;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--color-accent), transparent 92%);
  transform: scaleX(0.28);
  transform-origin: left center;
  transition: transform var(--motion-base) ease;
}

.blog-featured:hover .blog-featured__title-link::after {
  transform: scaleX(1);
}

@keyframes sweepGlow {
  0%,
  100% {
    transform: translate3d(-22%, 0, 0) rotate(14deg);
    opacity: 0;
  }

  20%,
  42% {
    opacity: 1;
  }

  62% {
    transform: translate3d(250%, 0, 0) rotate(14deg);
    opacity: 0;
  }
}

@media (max-width: 1080px) {
  .blog-featured {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .blog-featured {
    padding: var(--space-lg);
  }
}
</style>
