<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getAdminArticleDetail } from '../services/articleEditor'
import type { ArticleEditorDraft } from '../types/articleEditor'

const route = useRoute()
const loading = ref(true)
const article = ref<ArticleEditorDraft | null>(null)

async function loadArticle() {
  try {
    article.value = await getAdminArticleDetail(String(route.params.id || ''))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<template>
  <main class="admin-article-detail-page">
    <section v-if="loading" class="admin-article-detail-card">文章详情加载中...</section>

    <section v-else-if="article" class="admin-article-detail-card">
      <p>Admin Article Detail</p>
      <h1>{{ article.title }}</h1>
      <span>{{ article.category }} · {{ article.status }}</span>
      <p class="admin-article-detail-summary">{{ article.summary }}</p>
      <img v-if="article.cover" :src="article.cover" :alt="article.title" class="admin-article-detail-cover" />
      <div class="admin-article-detail-content">
        <p v-for="paragraph in article.content.split('\n').filter(Boolean)" :key="paragraph">{{ paragraph }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-article-detail-page {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
  padding: 96px 0 80px;
}
.admin-article-detail-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255,253,248,.85);
  box-shadow: var(--shadow-soft);
}
.admin-article-detail-card p:first-child {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}
.admin-article-detail-card h1 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}
.admin-article-detail-card span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
}
.admin-article-detail-summary {
  margin-top: var(--space-lg);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.admin-article-detail-cover {
  width: 100%;
  max-height: 24rem;
  object-fit: cover;
  border-radius: var(--radius-2xl);
  margin-top: var(--space-lg);
}
.admin-article-detail-content {
  margin-top: var(--space-lg);
  color: var(--color-text-strong);
  line-height: 1.9;
}
.admin-article-detail-content p + p {
  margin-top: .9rem;
}
</style>
