<script setup lang="ts">
import { computed } from 'vue'
import type { PublicBlogPageData } from '../../types/blog'

const props = defineProps<{
  data: Pick<PublicBlogPageData, 'eyebrow' | 'title' | 'description' | 'categories'>
  activeCategory?: string
}>()

const emit = defineEmits<{
  selectCategory: [category: string]
}>()

function splitTitleTokens(title: string) {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return []
  }

  if (/\s/.test(trimmedTitle)) {
    return trimmedTitle.split(/\s+/)
  }

  const chars = Array.from(trimmedTitle)
  const tokens: string[] = []

  for (let index = 0; index < chars.length; index += 2) {
    tokens.push(chars.slice(index, index + 2).join(''))
  }

  return tokens
}

const titleTokens = computed(() => splitTitleTokens(props.data.title))
</script>

<template>
  <section class="blog-hero reveal-on-scroll" v-reveal="{ delay: 0, y: 30 }">
    <div class="blog-hero__copy">
      <p class="blog-hero__eyebrow">{{ data.eyebrow }}</p>
      <h1 :aria-label="data.title">
        <span
          v-for="(token, index) in titleTokens"
          :key="`${token}-${index}`"
          class="blog-hero__title-token"
          :style="{ '--token-delay': `${180 + index * 80}ms` }"
        >
          {{ token }}
        </span>
      </h1>
      <p class="blog-hero__description">{{ data.description }}</p>
    </div>

    <div class="blog-hero__categories">
      <article
        v-for="(category, index) in data.categories"
        :key="category.label"
        class="blog-hero__category"
        v-reveal="140 + index * 90"
        :class="{ 'blog-hero__category--active': activeCategory === category.label }"
        @click="emit('selectCategory', category.label === '全部文章' ? '' : category.label)"
      >
        <strong>{{ category.label }}</strong>
        <span>{{ category.count }}</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.blog-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  gap: var(--space-2xl);
  padding: var(--space-4xl);
  border-radius: var(--radius-3xl);
  border: 1px solid var(--color-border-soft);
  background:
    radial-gradient(circle at 16% 20%, rgba(240, 179, 91, 0.22), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(115, 216, 231, 0.16), transparent 28%),
    linear-gradient(145deg, rgba(9, 18, 31, 0.98), rgba(14, 28, 45, 0.94));
  box-shadow: var(--shadow-hero);
}

.blog-hero__eyebrow {
  margin: 0;
  color: var(--color-accent);
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.blog-hero h1 {
  margin: var(--space-sm) 0 var(--space-md);
  color: var(--color-surface);
  font-family: var(--font-family-display);
  font-size: clamp(3.3rem, 7vw, 5.4rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
}

.blog-hero__title-token {
  display: inline-block;
  margin-right: 0.2em;
  opacity: 0;
  transform: translateY(1rem) rotateX(-12deg);
  animation: blogTitleReveal 780ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--token-delay, 200ms);
}

.blog-hero__title-token:last-child {
  margin-right: 0;
}

.blog-hero__description {
  max-width: 42rem;
  margin: 0;
  color: var(--color-text-inverse-soft);
  font-size: var(--font-size-lg);
  line-height: 1.9;
}

.blog-hero__categories {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  align-content: center;
}

.blog-hero__category {
  cursor: pointer;
  padding: var(--space-lg);
  border: 1px solid rgba(245, 241, 232, 0.1);
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.05);
  transition:
    transform var(--motion-base) ease,
    border-color var(--motion-base) ease,
    background-color var(--motion-base) ease;
}

.blog-hero__category:hover {
  transform: translateY(-2px);
  border-color: rgba(247, 193, 70, 0.34);
}

.blog-hero__category--active {
  border-color: rgba(240, 179, 91, 0.44);
  background: rgba(240, 179, 91, 0.12);
}

.blog-hero__category strong {
  display: block;
  color: var(--color-surface);
  font-size: 1.04rem;
}

.blog-hero__category span {
  display: inline-block;
  margin-top: var(--space-sm);
  color: var(--color-accent);
  font-family: var(--font-family-display);
  font-size: 2.15rem;
  font-weight: 700;
}

@keyframes blogTitleReveal {
  from {
    opacity: 0;
    transform: translateY(1rem) rotateX(-12deg);
    filter: blur(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
    filter: blur(0);
  }
}

@media (max-width: 1080px) {
  .blog-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .blog-hero {
    padding: var(--space-lg);
  }

  .blog-hero__categories {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .blog-hero__categories {
    grid-template-columns: 1fr;
  }
}
</style>
