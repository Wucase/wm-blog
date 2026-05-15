<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AdminManageNav from '../components/admin/AdminManageNav.vue'
import { deleteAdminArticle, getAdminArticles, updateAdminArticleStatus } from '../services/articleEditor'
import type { AdminArticleSummary } from '../types/adminArticle'

const router = useRouter()
const loading = ref(true)
const articles = ref<AdminArticleSummary[]>([])
const updatingArticleId = ref('')
const keyword = ref('')
const status = ref('all')
const deletingArticle = ref<AdminArticleSummary | null>(null)

const filteredCountText = computed(() => `共 ${articles.value.length} 篇`)

async function loadArticles() {
  loading.value = true

  try {
    articles.value = await getAdminArticles(keyword.value, status.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
})

async function handleStatusChange(article: AdminArticleSummary, nextStatus: string) {
  updatingArticleId.value = article.id

  try {
    const nextArticle = await updateAdminArticleStatus(article.id, nextStatus)
    articles.value = articles.value.map((item) => (item.id === article.id ? nextArticle : item))
  } finally {
    updatingArticleId.value = ''
  }
}

async function handleDeleteConfirm() {
  if (!deletingArticle.value) {
    return
  }

  const articleId = deletingArticle.value.id
  updatingArticleId.value = articleId
  try {
    await deleteAdminArticle(articleId)
    articles.value = articles.value.filter((article) => article.id !== articleId)
  } finally {
    updatingArticleId.value = ''
    deletingArticle.value = null
  }
}
</script>

<template>
  <main class="admin-article-page">
    <section class="admin-article-shell">
      <header class="admin-article-hero">
        <p>Admin Articles</p>
        <h1>管理员文章管理</h1>
        <span>统一查看当前站点的全部文章状态、作者和最近更新时间。</span>
      </header>

      <AdminManageNav />

      <section class="admin-filter-card">
        <input v-model="keyword" type="text" placeholder="搜索文章标题或摘要" @keydown.enter.prevent="loadArticles" />
        <select v-model="status" @change="loadArticles">
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="public">公开</option>
          <option value="private">私密</option>
        </select>
        <button type="button" class="admin-filter-card__btn" @click="loadArticles">筛选</button>
        <span class="admin-filter-card__count">{{ filteredCountText }}</span>
      </section>

      <section class="admin-article-card">
        <div v-if="loading" class="admin-article-loading">文章列表加载中...</div>

        <div v-else-if="articles.length === 0" class="admin-article-loading">当前还没有文章数据。</div>

        <div v-else class="admin-article-table">
          <article v-for="article in articles" :key="article.id" class="admin-article-row">
            <div>
              <div class="admin-article-row__meta">
                <span>{{ article.status }}</span>
                <span>{{ article.category }}</span>
              </div>
              <h2>{{ article.title }}</h2>
              <p>作者：{{ article.authorName || article.authorId }}</p>
            </div>
            <div class="admin-article-row__time">
              <strong>更新：{{ article.updatedAt }}</strong>
              <span v-if="article.publishedAt">发布：{{ article.publishedAt }}</span>
            </div>
            <div class="admin-article-row__actions">
              <button
                type="button"
                class="admin-article-row__action"
                :disabled="updatingArticleId === article.id"
                @click="handleStatusChange(article, 'draft')"
              >
                草稿
              </button>
              <button
                type="button"
                class="admin-article-row__action admin-article-row__action--solid"
                :disabled="updatingArticleId === article.id"
                @click="handleStatusChange(article, 'public')"
              >
                公开
              </button>
              <button
                type="button"
                class="admin-article-row__action"
                :disabled="updatingArticleId === article.id"
                @click="handleStatusChange(article, 'private')"
              >
                私密
              </button>
              <button
                type="button"
                class="admin-article-row__action"
                :disabled="updatingArticleId === article.id"
                @click="router.push(`/wm/admin/articles/${article.id}`)"
              >
                详情
              </button>
              <button
                type="button"
                class="admin-article-row__action admin-article-row__action--danger"
                :disabled="updatingArticleId === article.id"
                @click="deletingArticle = article"
              >
                删除
              </button>
            </div>
          </article>
        </div>
      </section>

      <div v-if="deletingArticle" class="admin-delete-mask" @click.self="deletingArticle = null">
        <section class="admin-delete-dialog">
          <p>Delete Article</p>
          <h2>确认删除这篇文章？</h2>
          <span>
            《{{ deletingArticle.title }}》删除后不可恢复，公开页和用户文章列表都会同步移除。
          </span>

          <div class="admin-delete-dialog__actions">
            <button type="button" class="admin-article-row__action" @click="deletingArticle = null">取消</button>
            <button
              type="button"
              class="admin-article-row__action admin-article-row__action--danger"
              :disabled="updatingArticleId === deletingArticle.id"
              @click="handleDeleteConfirm"
            >
              {{ updatingArticleId === deletingArticle.id ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-article-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 96px 0 80px;
}
.admin-article-shell {
  display: grid;
  gap: var(--space-xl);
}
.admin-article-hero,
.admin-filter-card,
.admin-article-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255,253,248,.85);
  box-shadow: var(--shadow-soft);
}
.admin-filter-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(10rem, .6fr) auto auto;
  gap: .8rem;
  align-items: center;
}
.admin-filter-card input,
.admin-filter-card select {
  width: 100%;
  border: 1px solid rgba(16,42,67,.12);
  border-radius: 1rem;
  background: rgba(255,255,255,.86);
  outline: none;
  padding: .82rem .95rem;
  font: inherit;
}
.admin-filter-card__btn {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  padding: .8rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.admin-filter-card__count {
  color: var(--color-text-secondary);
  justify-self: end;
}
.admin-article-hero p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}
.admin-article-hero h1 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}
.admin-article-hero span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
}
.admin-article-table {
  display: grid;
  gap: var(--space-md);
}
.admin-article-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 1rem 1.1rem;
  border-radius: var(--radius-2xl);
  background: rgba(16,42,67,.05);
}
.admin-article-row__meta {
  display: flex;
  gap: .6rem;
}
.admin-article-row__meta span {
  padding: .35rem .65rem;
  border-radius: 999px;
  background: rgba(214,142,52,.14);
  color: var(--color-accent-deep);
  font-size: .76rem;
  font-weight: 700;
}
.admin-article-row h2 {
  margin-top: .65rem;
  font-size: 1.08rem;
  color: var(--color-text-strong);
}
.admin-article-row p,
.admin-article-row__time span {
  color: var(--color-text-secondary);
}
.admin-article-row__time {
  display: grid;
  gap: .35rem;
  text-align: right;
}
.admin-article-row__actions {
  display: flex;
  gap: .55rem;
  flex-wrap: wrap;
}
.admin-article-row__action {
  border: 0;
  border-radius: 999px;
  background: rgba(16,42,67,.08);
  color: var(--color-primary);
  padding: .55rem .85rem;
  font: inherit;
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
}
.admin-article-row__action--solid {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
}
.admin-article-row__action--danger {
  background: rgba(193, 75, 75, 0.12);
  color: #9d3131;
}
.admin-article-row__action:disabled {
  opacity: .68;
  cursor: wait;
}
.admin-article-loading {
  color: var(--color-text-secondary);
}
.admin-delete-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(16, 42, 67, 0.26);
  backdrop-filter: blur(12px);
}
.admin-delete-dialog {
  width: min(100%, 28rem);
  padding: 1.35rem;
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.96);
  box-shadow: var(--shadow-card);
}
.admin-delete-dialog p {
  color: #9d3131;
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}
.admin-delete-dialog h2 {
  margin-top: .55rem;
  color: var(--color-text-strong);
}
.admin-delete-dialog span {
  display: block;
  margin-top: .75rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
}
.admin-delete-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: .65rem;
  margin-top: 1.1rem;
}
@media (max-width: 720px) {
  .admin-article-page {
    width: min(100% - 20px, 1180px);
    padding: 88px 0 40px;
  }
  .admin-article-hero,
  .admin-filter-card,
  .admin-article-card {
    padding: var(--space-lg);
  }
  .admin-filter-card {
    grid-template-columns: 1fr;
  }
  .admin-article-row {
    display: grid;
  }
  .admin-article-row__time {
    text-align: left;
  }
}
</style>
