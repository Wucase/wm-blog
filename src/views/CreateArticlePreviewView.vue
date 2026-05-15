<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HomeNav from '../components/home/HomeNav.vue'
import { homeNav } from '../data/home'
import {
  cacheArticlePreviewDraft,
  getUserArticleDetail,
  publishArticleDraft,
  readArticlePreviewDraft,
} from '../services/articleEditor'
import { useAuthStore } from '../stores/auth'
import type { ArticleEditorDraft } from '../types/articleEditor'
import type { HomeNavUser } from '../types/home'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const publishing = ref(false)
const feedbackMessage = ref('')
const previewDraft = ref<ArticleEditorDraft | null>(null)

const currentUser = computed<HomeNavUser | null>(() => {
  if (!authStore.user) {
    return null
  }

  return {
    name: authStore.user.name,
    avatarText: authStore.user.avatarText,
    createHref: '/wm/user/create',
    menu: [
      { label: '个人中心', href: '/wm/user/profile', action: 'navigate' },
      { label: '退出登录', href: '/wm/blog', action: 'logout' },
    ],
  }
})

const previewParagraphs = computed(() => {
  return previewDraft.value?.content.split('\n').filter(Boolean) ?? []
})

const backTarget = computed(() => {
  const articleId = String(route.query.id || '')
  return articleId
    ? { path: '/wm/user/create', query: { id: articleId } }
    : { path: '/wm/user/create' }
})

async function loadPreviewDraft() {
  loading.value = true

  try {
    const cachedDraft = readArticlePreviewDraft()
    if (cachedDraft?.title.trim() || cachedDraft?.content.trim()) {
      previewDraft.value = cachedDraft
      return
    }

    const articleId = String(route.query.id || '')
    if (articleId && authStore.user?.id) {
      previewDraft.value = await getUserArticleDetail(articleId)
      return
    }

    previewDraft.value = cachedDraft
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPreviewDraft()
})

async function handlePublish() {
  if (!previewDraft.value || !authStore.user?.id) {
    return
  }

  publishing.value = true
  feedbackMessage.value = ''

  try {
    const savedDraft = await publishArticleDraft(
      {
        ...previewDraft.value,
        status: 'public',
        publishTime: previewDraft.value.publishTime || new Date().toISOString().slice(0, 16),
      },
    )

    previewDraft.value = savedDraft
    cacheArticlePreviewDraft(savedDraft)
    feedbackMessage.value = '文章已发布，可直接查看公开详情。'

    if (savedDraft.id) {
      await router.push(`/wm/blog/${savedDraft.id}`)
    }
  } finally {
    publishing.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
}
</script>

<template>
  <main class="article-preview-page">
    <HomeNav :nav="homeNav" :current-user="currentUser" @logout="handleLogout" />

    <section class="article-preview-shell">
      <header class="article-preview-head">
        <div>
          <p>Preview</p>
          <h1>文章预览</h1>
          <span>这里展示当前创作内容的阅读态效果，返回后可继续编辑。</span>
        </div>

        <button type="button" class="article-preview-head__back" @click="router.push(backTarget)">
          返回继续编辑
        </button>
      </header>

      <section v-if="loading" class="article-preview-empty">预览内容加载中...</section>
      <section v-else-if="!previewDraft" class="article-preview-empty">当前还没有可预览的文章内容。</section>
      <section v-else class="article-preview-card">
        <div class="article-preview-toolbar">
          <button type="button" class="article-preview-toolbar__btn article-preview-toolbar__btn--light" @click="router.push(backTarget)">
            返回编辑
          </button>
          <button
            type="button"
            class="article-preview-toolbar__btn"
            :disabled="publishing"
            @click="handlePublish"
          >
            {{ publishing ? '发布中...' : '直接发布' }}
          </button>
        </div>

        <div class="article-preview-meta">
          <span>{{ previewDraft.category || '未分类' }}</span>
          <span>{{ previewDraft.publishTime || '未设置发布时间' }}</span>
          <span>{{ previewDraft.contentType }}</span>
        </div>

        <h2>{{ previewDraft.title || '未命名文章' }}</h2>
        <p class="article-preview-summary">{{ previewDraft.summary || '这里会展示文章摘要。' }}</p>

        <img
          v-if="previewDraft.cover"
          :src="previewDraft.cover"
          alt="文章预览封面"
          class="article-preview-cover"
        />

        <div v-if="previewDraft.tags.length" class="article-preview-tags">
          <span v-for="tag in previewDraft.tags" :key="tag">{{ tag }}</span>
        </div>

        <article class="article-preview-content">
          <p v-for="paragraph in previewParagraphs" :key="paragraph">{{ paragraph }}</p>
          <p v-if="previewParagraphs.length === 0">这里会显示正文内容预览。</p>
        </article>

        <footer class="article-preview-footer">
          <span>状态：{{ previewDraft.status }}</span>
          <span v-if="previewDraft.lastSavedAt">最近保存：{{ previewDraft.lastSavedAt.replace('T', ' ').slice(0, 16) }}</span>
        </footer>

        <p v-if="feedbackMessage" class="article-preview-feedback">{{ feedbackMessage }}</p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.article-preview-page {
  width: min(1080px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.article-preview-shell {
  display: grid;
  gap: var(--space-xl);
}

.article-preview-head,
.article-preview-card,
.article-preview-empty {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.84);
  box-shadow: var(--shadow-soft);
}

.article-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.article-preview-head p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.article-preview-head h1 {
  margin-top: .35rem;
  color: var(--color-text-strong);
}

.article-preview-head span {
  display: block;
  margin-top: .6rem;
  color: var(--color-text-secondary);
}

.article-preview-head__back {
  border: 0;
  border-radius: 999px;
  padding: .82rem 1.2rem;
  font: inherit;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
}

.article-preview-empty {
  color: var(--color-text-secondary);
}

.article-preview-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: .65rem;
}

.article-preview-toolbar__btn {
  border: 0;
  border-radius: 999px;
  padding: .75rem 1.15rem;
  font: inherit;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
}

.article-preview-toolbar__btn--light {
  color: var(--color-primary);
  background: rgba(16, 42, 67, 0.08);
}

.article-preview-toolbar__btn:disabled {
  opacity: .72;
  cursor: wait;
}

.article-preview-meta,
.article-preview-tags,
.article-preview-footer {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
}

.article-preview-meta span,
.article-preview-tags span,
.article-preview-footer span {
  padding: .42rem .72rem;
  border-radius: 999px;
  background: rgba(214, 142, 52, 0.12);
  color: var(--color-accent-deep);
  font-size: .78rem;
  font-weight: 700;
}

.article-preview-card h2 {
  margin-top: 1rem;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.06;
  color: var(--color-text-strong);
}

.article-preview-summary {
  margin-top: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.85;
}

.article-preview-cover {
  width: 100%;
  max-height: 28rem;
  margin-top: 1.25rem;
  border-radius: calc(var(--radius-2xl) + .2rem);
  object-fit: cover;
  box-shadow: var(--shadow-card);
}

.article-preview-tags {
  margin-top: 1.25rem;
}

.article-preview-content {
  margin-top: 1.4rem;
}

.article-preview-content p {
  color: var(--color-text-strong);
  line-height: 1.9;
}

.article-preview-content p + p {
  margin-top: .95rem;
}

.article-preview-footer {
  margin-top: 1.5rem;
}

.article-preview-feedback {
  margin-top: 1rem;
  color: var(--color-accent-deep);
}

@media (max-width: 720px) {
  .article-preview-page {
    width: min(100% - 20px, 1080px);
    padding: 88px 0 40px;
  }

  .article-preview-head {
    display: grid;
  }

  .article-preview-head,
  .article-preview-card,
  .article-preview-empty {
    padding: 1.2rem;
  }
}
</style>
