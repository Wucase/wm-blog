<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  getPublicBlogArticleActionState,
  increasePublicBlogArticleShare,
  togglePublicBlogArticleCollect,
  togglePublicBlogArticleLike,
} from '../../services/blogInteraction'
import { useAuthStore } from '../../stores/auth'
import type {
  PublicBlogArticle,
  PublicBlogArticleActionState,
  PublicBlogPageData,
} from '../../types/blog'

const props = defineProps<{
  articles: PublicBlogPageData['articles']
  loadingMore?: boolean
  hasMore?: boolean
  isFiltered?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const articleActionMap = reactive<Record<string, PublicBlogArticleActionState>>({})

watch(
  () => props.articles,
  async (articles) => {
    const actionEntries = await Promise.all(
      articles.map(async (article, index) => ({
        id: article.id,
        state: await getPublicBlogArticleActionState(article.id, index),
      })),
    )

    actionEntries.forEach(({ id, state }) => {
      articleActionMap[id] = state
    })
  },
  {
    immediate: true,
  },
)

async function toggleLike(article: PublicBlogArticle) {
  if (!authStore.isLoggedIn) {
    await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  articleActionMap[article.id] = await togglePublicBlogArticleLike(article.id)
}

async function toggleCollect(article: PublicBlogArticle) {
  if (!authStore.isLoggedIn) {
    await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  articleActionMap[article.id] = await togglePublicBlogArticleCollect(article.id)
}

async function increaseShare(article: PublicBlogArticle) {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`/wm/blog/${article.id}`)
    } catch {
      // 复制失败时不阻塞分享计数更新。
    }
  }

  articleActionMap[article.id] = await increasePublicBlogArticleShare(article.id)
}
</script>

<template>
  <section class="article-stream reveal-on-scroll" v-reveal="{ delay: 0, y: 28 }">
    <div class="article-stream__heading">
      <p>Open Reading List</p>
      <h2>游客可浏览的公开文章</h2>
    </div>

    <div class="article-stream__grid">
      <article
        v-for="(article, index) in articles"
        :key="`${article.title}-${article.publishDate}`"
        class="article-card"
        v-reveal="index * 70"
      >
        <img :src="article.image" :alt="article.title" class="article-card__image" />

        <div class="article-card__body">
          <div class="article-card__tags">
            <span>{{ article.category }}</span>
            <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
          </div>

          <a :href="`/wm/blog/${article.id}`" class="article-card__title-link">
            <h3>{{ article.title }}</h3>
          </a>
          <p class="article-card__summary">{{ article.summary }}</p>

          <div class="article-card__footer">
            <div class="article-card__author">
              <span class="article-card__avatar">{{ article.author.avatarText }}</span>
              <div>
                <strong>{{ article.author.name }}</strong>
                <small>{{ article.author.role }}</small>
              </div>
            </div>

            <div class="article-card__meta">
              <span>{{ article.publishDate }}</span>
              <span>{{ article.readTime }}</span>
            </div>
          </div>

          <div class="article-card__actions">
            <button
              type="button"
              class="article-card__action"
              :class="{ 'article-card__action--active': articleActionMap[article.id]?.liked }"
              @click="toggleLike(article)"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M12 20L10.55 18.68C5.4 14 2 10.91 2 7.12C2 4.03 4.42 2 7.5 2C9.24 2 10.91 2.81 12 4.09C13.09 2.81 14.76 2 16.5 2C19.58 2 22 4.03 22 7.12C22 10.91 18.6 14 13.45 18.68L12 20Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ articleActionMap[article.id]?.likeCount ?? 0 }}</span>
            </button>

            <button
              type="button"
              class="article-card__action"
              :class="{ 'article-card__action--active': articleActionMap[article.id]?.collected }"
              @click="toggleCollect(article)"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M6 3.5H18C19.1 3.5 20 4.4 20 5.5V20L12 15.6L4 20V5.5C4 4.4 4.9 3.5 6 3.5Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ articleActionMap[article.id]?.collectCount ?? 0 }}</span>
            </button>

            <button type="button" class="article-card__action">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H9L4 20V5.5Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ articleActionMap[article.id]?.commentCount ?? 0 }}</span>
            </button>

            <button type="button" class="article-card__action" @click="increaseShare(article)">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M14 5L20 5L20 11"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 14L20 5"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <path
                  d="M19 14V18.5C19 19.33 18.33 20 17.5 20H5.5C4.67 20 4 19.33 4 18.5V6.5C4 5.67 4.67 5 5.5 5H10"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ articleActionMap[article.id]?.shareCount ?? 0 }}</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="hasMore" class="article-stream__actions">
      <button
        type="button"
        class="article-stream__more-btn"
        :disabled="loadingMore"
        @click="emit('loadMore')"
      >
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <p v-else-if="articles.length > 0" class="article-stream__status">
      {{ isFiltered ? '筛选结果已经全部展示完了。' : '已经到底了，没有更多公开文章了。' }}
    </p>

    <p v-else class="article-stream__status">当前条件下没有找到公开文章。</p>
  </section>
</template>

<style scoped>
.article-stream {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at top right, rgba(115, 216, 231, 0.12), transparent 28%),
    rgba(12, 23, 36, 0.86);
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
}

.article-stream__heading p {
  margin: 0;
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.article-stream__heading h2 {
  margin: var(--space-sm) 0 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: clamp(2.2rem, 4vw, 3.3rem);
}

.article-stream__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
  margin-top: 1.25rem;
}

.article-stream__actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

.article-stream__more-btn {
  min-width: 9rem;
  padding: 0.82rem 1.4rem;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(145deg, rgba(240, 179, 91, 0.98), rgba(214, 139, 42, 0.96));
  color: var(--color-primary-deep);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition:
    transform var(--motion-base) ease,
    opacity var(--motion-base) ease;
}

.article-stream__more-btn:hover {
  transform: translateY(-2px);
}

.article-stream__more-btn:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

.article-stream__status {
  margin: var(--space-xl) 0 0;
  text-align: center;
  color: var(--color-text-secondary);
}

.article-card {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  overflow: hidden;
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(245, 241, 232, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015)),
    rgba(16, 28, 44, 0.9);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--motion-base) ease,
    border-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.article-card:hover {
  transform: translateY(-6px);
  border-color: rgba(240, 179, 91, 0.2);
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.3);
}

.article-card__image {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  transition:
    transform 900ms ease,
    filter 600ms ease;
}

.article-card:hover .article-card__image {
  transform: scale(1.06);
  filter: saturate(1.08);
}

.article-card__body {
  padding: 0.88rem;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-card__tags span {
  padding: 0.34rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-secondary);
  font-size: 0.76rem;
}

.article-card h3 {
  margin: 0.7rem 0 0.52rem;
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: 1.42rem;
  line-height: 1.14;
}

.article-card__title-link {
  display: inline-block;
}

.article-card__summary {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  line-height: 1.56;
}

.article-card__footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  align-items: end;
  margin-top: 0.82rem;
}

.article-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.82rem;
}

.article-card__action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.36rem 0.64rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    transform var(--motion-base) ease,
    background-color var(--motion-base) ease,
    color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.article-card__action:hover {
  transform: translateY(-3px);
  background: rgba(240, 179, 91, 0.12);
  color: var(--color-text-strong);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
}

.article-card__action--active {
  background: rgba(240, 179, 91, 0.14);
  color: var(--color-accent);
}

.article-card__action svg {
  width: 0.88rem;
  height: 0.88rem;
  flex: 0 0 auto;
}

.article-card__author {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.article-card__avatar {
  display: inline-grid;
  place-items: center;
  width: 2.05rem;
  height: 2.05rem;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(247, 193, 70, 0.9), rgba(214, 142, 52, 1));
  color: var(--color-primary-deep);
  font-weight: 800;
  font-size: 0.74rem;
}

.article-card__author strong {
  display: block;
  color: var(--color-text-strong);
}

.article-card__author small,
.article-card__meta {
  color: var(--color-text-secondary);
}

.article-card__author small {
  font-size: 0.78rem;
}

.article-card__meta {
  display: grid;
  gap: 0.24rem;
  text-align: right;
  font-size: 0.76rem;
}

@media (max-width: 960px) {
  .article-stream__grid {
    grid-template-columns: 1fr;
  }

  .article-card {
    grid-template-columns: 1fr;
  }

  .article-card__image {
    aspect-ratio: 1 / 0.66;
    height: auto;
    min-height: 0;
  }
}

@media (max-width: 720px) {
  .article-stream {
    padding: var(--space-lg);
  }

  .article-card__footer {
    display: grid;
    align-items: start;
  }

  .article-card__meta {
    text-align: left;
  }
}
</style>
