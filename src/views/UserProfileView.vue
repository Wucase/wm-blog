<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HomeNav from '../components/home/HomeNav.vue'
import { homeNav } from '../data/home'
import { clearArticleEditorDraft, readArticleEditorDraft } from '../services/articleEditor'
import { getUserCollectedArticles } from '../services/blog'
import { removePublicBlogArticleCollect } from '../services/blogInteraction'
import { useAuthStore } from '../stores/auth'
import type { HomeNavUser } from '../types/home'
import type { UserArticleSummary } from '../types/articleEditor'
import type { PublicBlogArticle } from '../types/blog'
import { getUserArticles } from '../services/articleEditor'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(true)
const articleList = ref<UserArticleSummary[]>([])
const collectionList = ref<PublicBlogArticle[]>([])
const pageMessage = ref('')

const currentUser = computed<HomeNavUser | null>(() => {
  if (!authStore.user) {
    return null
  }

  return {
    name: authStore.user.name,
    avatarText: authStore.user.avatarText,
    createHref: '/wm/user/create',
    menu: [
      {
        label: '个人中心',
        href: '/wm/user/profile',
        action: 'navigate',
      },
      {
        label: '退出登录',
        href: '/wm/blog',
        action: 'logout',
      },
    ],
  }
})

const localDraft = computed(() => readArticleEditorDraft())

async function loadUserArticles() {
  if (!authStore.user?.id) {
    return
  }

  try {
    articleList.value = await getUserArticles()
    collectionList.value = await getUserCollectedArticles()
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

function openCreatePage() {
  router.push('/wm/user/create')
}

function resetLocalDraft() {
  clearArticleEditorDraft()
  pageMessage.value = '本地草稿已清空。'
}

async function cancelCollect(articleId: string) {
  await removePublicBlogArticleCollect(articleId)
  collectionList.value = collectionList.value.filter((article) => article.id !== articleId)
  pageMessage.value = '收藏已取消。'
}

onMounted(() => {
  loadUserArticles()
})
</script>

<template>
  <main class="profile-page">
    <HomeNav :nav="homeNav" :current-user="currentUser" @logout="handleLogout" />

    <section class="profile-shell">
      <header class="profile-hero">
        <div>
          <p class="profile-hero__eyebrow">User Center</p>
          <h1>{{ authStore.user?.name || '我的创作空间' }}</h1>
          <p class="profile-hero__description">
            这里集中查看自己的文章、当前草稿和创作状态。后续接更多用户能力时，这里可以继续扩展为完整个人中心。
          </p>
        </div>

        <div class="profile-hero__actions">
          <button type="button" class="profile-btn profile-btn--solid" @click="openCreatePage">写新文章</button>
          <button type="button" class="profile-btn" @click="router.push('/wm/user/settings')">资料设置</button>
          <button type="button" class="profile-btn" @click="resetLocalDraft">清空本地草稿</button>
        </div>
      </header>

      <div class="profile-layout">
        <section class="profile-main">
          <article class="profile-card">
            <div class="profile-card__header">
              <div>
                <p>我的文章</p>
                <h2>已创建的内容</h2>
              </div>
            </div>

            <div v-if="loading" class="profile-card__loading">文章列表加载中...</div>

            <div v-else-if="articleList.length === 0" class="profile-card__empty">
              还没有文章，先去写第一篇吧。
            </div>

            <div v-else class="article-list">
              <article v-for="article in articleList" :key="article.id" class="article-list__item">
                <div>
                  <div class="article-list__top">
                    <span class="article-list__status" :data-status="article.status">{{ article.status }}</span>
                    <span class="article-list__category">{{ article.category }}</span>
                  </div>
                  <h3>{{ article.title }}</h3>
                  <p>
                    更新时间：{{ article.updatedAt }}
                    <span v-if="article.publishedAt"> · 发布时间：{{ article.publishedAt }}</span>
                  </p>
                </div>

                <button type="button" class="profile-btn" @click="router.push(`/wm/user/create?id=${article.id}`)">继续编辑</button>
              </article>
            </div>
          </article>
        </section>

        <aside class="profile-side">
          <article class="profile-card">
            <div class="profile-card__header">
              <div>
                <p>我的收藏</p>
                <h2>已收藏的公开文章</h2>
              </div>
            </div>

            <div v-if="collectionList.length === 0" class="profile-card__empty">
              你还没有收藏公开文章。
            </div>

            <div v-else class="collection-list">
              <article
                v-for="article in collectionList"
                :key="article.id"
                class="collection-list__item"
              >
                <a :href="`/wm/blog/${article.id}`" class="collection-list__link">
                  <strong>{{ article.title }}</strong>
                  <span>{{ article.category }} · {{ article.publishDate }}</span>
                </a>
                <button type="button" class="profile-btn" @click="cancelCollect(article.id)">取消收藏</button>
              </article>
            </div>
          </article>

          <article class="profile-card">
            <div class="profile-card__header">
              <div>
                <p>当前草稿</p>
                <h2>未发布内容</h2>
              </div>
            </div>

            <div class="draft-summary">
              <strong>{{ localDraft.title || '未命名草稿' }}</strong>
              <p>{{ localDraft.summary || '当前本地草稿还没有摘要内容。' }}</p>
              <span>分类：{{ localDraft.category || '未选择' }}</span>
              <span>状态：{{ localDraft.status }}</span>
            </div>
          </article>

          <article class="profile-card">
            <div class="profile-card__header">
              <div>
                <p>页面提示</p>
                <h2>当前状态</h2>
              </div>
            </div>

            <p class="page-message">{{ pageMessage || '创作页已经接入真实草稿保存和发布接口。' }}</p>
          </article>
        </aside>
      </div>
    </section>
  </main>
</template>

<style scoped>
.profile-page {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.profile-shell,
.profile-main,
.profile-side {
  display: grid;
  gap: var(--space-xl);
}

.profile-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: linear-gradient(145deg, rgba(9, 24, 38, 0.97), rgba(18, 44, 68, 0.94));
  box-shadow: var(--shadow-hero);
}

.profile-hero__eyebrow {
  color: var(--color-accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: var(--font-size-caption);
}

.profile-hero h1 {
  margin-top: var(--space-sm);
  color: var(--color-surface);
  font-size: clamp(2.2rem, 5vw, 3.6rem);
}

.profile-hero__description {
  margin-top: var(--space-md);
  max-width: 44rem;
  color: var(--color-text-inverse-soft);
  line-height: 1.8;
}

.profile-hero__actions {
  display: grid;
  gap: 0.8rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(18rem, 0.8fr);
  gap: var(--space-xl);
}

.profile-card {
  padding: var(--space-xl);
  border: 1px solid var(--color-border-warm);
  border-radius: var(--radius-3xl);
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.95), rgba(255, 248, 238, 0.88));
  box-shadow: var(--shadow-soft);
}

.profile-card__header {
  margin-bottom: var(--space-lg);
}

.profile-card__header p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.profile-card__header h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
  font-size: 1.35rem;
}

.article-list {
  display: grid;
  gap: var(--space-md);
}

.article-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 1rem 1.05rem;
  border-radius: var(--radius-2xl);
  background: rgba(16, 42, 67, 0.05);
}

.article-list__top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.article-list__status,
.article-list__category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.article-list__status {
  background: rgba(214, 142, 52, 0.16);
  color: var(--color-accent-deep);
}

.article-list__status[data-status='public'] {
  background: rgba(40, 152, 90, 0.14);
  color: #2b8b57;
}

.article-list__category {
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
}

.article-list h3 {
  margin-top: 0.7rem;
  color: var(--color-text-strong);
  font-size: 1.08rem;
}

.article-list p,
.draft-summary p,
.draft-summary span,
.page-message,
.profile-card__loading,
.profile-card__empty {
  color: var(--color-text-secondary);
}

.draft-summary {
  display: grid;
  gap: 0.65rem;
}

.collection-list {
  display: grid;
  gap: 0.75rem;
}

.collection-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.88rem 0.95rem;
  border-radius: var(--radius-2xl);
  background: rgba(16, 42, 67, 0.05);
}

.collection-list__link {
  display: grid;
  gap: 0.3rem;
}

.collection-list__item strong {
  color: var(--color-text-strong);
}

.draft-summary strong {
  color: var(--color-text-strong);
  font-size: 1.1rem;
}

.profile-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  padding: 0.78rem 1.05rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.profile-btn--solid {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  box-shadow: var(--shadow-card);
}

@media (max-width: 1080px) {
  .profile-hero,
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-hero {
    display: grid;
  }
}

@media (max-width: 720px) {
  .profile-page {
    width: min(100% - 20px, 1280px);
    padding: 88px 0 40px;
  }

  .profile-hero,
  .profile-card {
    padding: var(--space-lg);
  }

  .article-list__item {
    display: grid;
  }
}
</style>
