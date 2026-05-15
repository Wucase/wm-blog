<script setup lang="ts">
import type { HomePageData } from '../../types/home'

defineProps<{
  posts: HomePageData['featuredPosts']
}>()
</script>

<template>
  <section id="featured" class="section-block reveal-on-scroll" v-reveal="0">
    <div class="section-heading">
      <p>Featured Articles</p>
      <h2>欢迎从这几篇开始认识 WM Blog</h2>
    </div>

    <div class="post-grid">
      <article
        v-for="(post, index) in posts"
        :key="post.title"
        class="post-card"
        v-reveal="160 + index * 110"
      >
        <div class="post-card__media">
          <img :src="post.image" :alt="post.title" />
        </div>

        <div class="post-card__body">
          <span>{{ post.tag }}</span>
          <h3>{{ post.title }}</h3>
          <p>{{ post.summary }}</p>
          <a href="/">阅读更多</a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section-block {
  position: relative;
  margin-top: var(--space-2xl);
  padding: var(--space-2xl);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at top right, rgba(240, 179, 91, 0.12), transparent 0 28%),
    rgba(13, 24, 38, 0.84);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.section-block::after {
  content: '';
  position: absolute;
  inset: -30% auto auto -18%;
  width: 38%;
  height: 180%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transform: rotate(16deg);
  animation: sweepGlow 10s ease-in-out infinite;
  pointer-events: none;
}

.section-heading p {
  margin: 0;
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: var(--space-sm) 0 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

.post-card {
  overflow: hidden;
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(245, 241, 232, 0.08);
  background: rgba(16, 28, 44, 0.8);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--motion-base) ease,
    box-shadow var(--motion-base) ease,
    border-color var(--motion-base) ease;
}

.post-card:hover {
  transform: translateY(-8px);
  border-color: rgba(240, 179, 91, 0.22);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
}

.post-card__media {
  aspect-ratio: 1 / 0.82;
  overflow: hidden;
}

.post-card__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 900ms ease,
    filter 600ms ease;
}

.post-card:hover .post-card__media img {
  transform: scale(1.08);
  filter: saturate(1.08);
}

.post-card__body {
  padding: var(--space-xl);
}

.post-card__body span {
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.post-card__body h3 {
  margin: var(--space-sm) 0 var(--space-sm);
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: 1.6rem;
  line-height: 1.16;
}

.post-card__body p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.post-card__body a {
  display: inline-flex;
  margin-top: var(--space-lg);
  color: var(--color-accent);
  font-weight: 700;
  position: relative;
}

.post-card__body a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.18rem;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0.36);
  transform-origin: left center;
  transition: transform var(--motion-base) ease;
}

.post-card:hover .post-card__body a::after {
  transform: scaleX(1);
}

@keyframes sweepGlow {
  0%,
  100% {
    transform: translate3d(-24%, 0, 0) rotate(16deg);
    opacity: 0;
  }

  18%,
  46% {
    opacity: 1;
  }

  64% {
    transform: translate3d(240%, 0, 0) rotate(16deg);
    opacity: 0;
  }
}

@media (max-width: 960px) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .section-block {
    padding: var(--space-lg);
  }

  .section-heading h2 {
    font-size: 1.7rem;
    line-height: 1.15;
  }

  .post-card__body {
    padding: var(--space-lg);
  }

  .post-card__body h3 {
    font-size: 1.15rem;
  }

  .post-card__body p {
    line-height: 1.7;
  }
}
</style>
