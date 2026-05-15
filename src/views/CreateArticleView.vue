<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

import HomeNav from '../components/home/HomeNav.vue'
import { homeNav } from '../data/home'
import {
  cacheArticlePreviewDraft,
  clearArticleEditorDraft,
  defaultArticleEditorDraft,
  getUserArticleDetail,
  publishArticleDraft,
  readArticleEditorDraft,
  saveArticleEditorDraft,
} from '../services/articleEditor'
import { useAuthStore } from '../stores/auth'
import type { ArticleEditorDraft, ArticleEditorStatus } from '../types/articleEditor'
import type { HomeNavUser } from '../types/home'

// 创作页直接读取登录态，导航、用户入口和编辑归属都围绕当前用户展开。
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const saving = ref(false)
const publishing = ref(false)
const feedbackMessage = ref('')
const tagInput = ref('')
const keywordInput = ref('')
const previewVisible = ref(false)
const autoSaving = ref(false)

let autoSaveTimer: number | null = null

const draft = reactive<ArticleEditorDraft>(readArticleEditorDraft())

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

const metaStats = computed(() => {
  const content = draft.content.trim()
  const wordCount = content.replace(/\s+/g, '').length

  return {
    wordCount,
    readMinutes: Math.max(1, Math.ceil(wordCount / 400)),
    summaryLength: draft.summary.trim().length,
  }
})

const canPublish = computed(() => {
  return Boolean(
    draft.title.trim() &&
      draft.summary.trim() &&
      draft.category.trim() &&
      draft.content.trim(),
  )
})

// 统一去重和去空值，避免标签和 SEO 关键词在展示层重复堆叠。
function normalizeListValue(rawValue: string) {
  return rawValue
    .trim()
    .replace(/\s+/g, ' ')
}

function addTag() {
  const nextTag = normalizeListValue(tagInput.value)
  if (!nextTag || draft.tags.includes(nextTag)) {
    tagInput.value = ''
    return
  }

  draft.tags.push(nextTag)
  tagInput.value = ''
}

function removeTag(tag: string) {
  draft.tags = draft.tags.filter((item) => item !== tag)
}

function addKeyword() {
  const nextKeyword = normalizeListValue(keywordInput.value)
  if (!nextKeyword || draft.seoKeywords.includes(nextKeyword)) {
    keywordInput.value = ''
    return
  }

  draft.seoKeywords.push(nextKeyword)
  keywordInput.value = ''
}

function removeKeyword(keyword: string) {
  draft.seoKeywords = draft.seoKeywords.filter((item) => item !== keyword)
}

function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      draft.cover = reader.result
    }
    input.value = ''
  }
  reader.readAsDataURL(file)
}

async function persistDraft(status?: ArticleEditorStatus) {
  if (!authStore.user?.id) {
    feedbackMessage.value = '当前未获取到用户信息，请重新登录。'
    return
  }

  if (status) {
    draft.status = status
  }

  saving.value = true
  feedbackMessage.value = ''

  try {
    const savedDraft = await saveArticleEditorDraft({ ...draft })
    Object.assign(draft, savedDraft)
    feedbackMessage.value = status === 'public' ? '文章发布信息已暂存。' : '草稿已保存。'
  } finally {
    saving.value = false
  }
}

async function openPreviewPage() {
  cacheArticlePreviewDraft({ ...draft })
  const previewQuery = draft.id ? { id: draft.id } : undefined
  await router.push({
    path: '/wm/user/create/preview',
    query: previewQuery,
  })
}

async function publishArticle() {
  if (!authStore.user?.id) {
    feedbackMessage.value = '当前未获取到用户信息，请重新登录。'
    return
  }

  if (!canPublish.value) {
    feedbackMessage.value = '请先补全标题、摘要、分类和正文内容。'
    return
  }

  publishing.value = true
  feedbackMessage.value = ''

  try {
    const savedDraft = await publishArticleDraft({
      ...draft,
      status: 'public',
      publishTime: draft.publishTime || new Date().toISOString().slice(0, 16),
    })

    Object.assign(draft, savedDraft)
    feedbackMessage.value = '文章已保存为发布状态。'
    if (savedDraft.id) {
      await router.push(`/wm/blog/${savedDraft.id}`)
    }
  } finally {
    publishing.value = false
  }
}

function resetDraft() {
  Object.assign(draft, structuredClone(defaultArticleEditorDraft))
  clearArticleEditorDraft()
  feedbackMessage.value = '创作内容已重置。'
}

async function handleLogout() {
  await authStore.logout()
  await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

async function loadEditingArticle() {
  const articleId = String(route.query.id || '')
  if (!articleId || !authStore.user?.id) {
    return
  }

  const articleDetail = await getUserArticleDetail(articleId)
  Object.assign(draft, articleDetail)
}

onMounted(() => {
  loadEditingArticle()
})

watch(
  () => ({
    title: draft.title,
    summary: draft.summary,
    cover: draft.cover,
    category: draft.category,
    tags: [...draft.tags],
    content: draft.content,
    contentType: draft.contentType,
    status: draft.status,
    allowComment: draft.allowComment,
    isRecommend: draft.isRecommend,
    isTop: draft.isTop,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    seoKeywords: [...draft.seoKeywords],
    publishTime: draft.publishTime,
  }),
  () => {
    if (!authStore.user?.id || !draft.title.trim()) {
      return
    }

    if (autoSaveTimer) {
      window.clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = window.setTimeout(async () => {
      autoSaving.value = true
      try {
        const savedDraft = await saveArticleEditorDraft({ ...draft })
        Object.assign(draft, savedDraft)
      } finally {
        autoSaving.value = false
      }
    }, 1200)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    window.clearTimeout(autoSaveTimer)
  }
})
</script>

<template>
  <main class="create-article-page">
    <HomeNav :nav="homeNav" :current-user="currentUser" @logout="handleLogout" />

    <section class="create-article-shell">
      <header class="create-article-hero">
        <div>
          <p class="create-article-hero__eyebrow">Create Article</p>
          <h1>创作你的下一篇公开博客</h1>
          <p class="create-article-hero__description">
            文章标题、摘要、正文、SEO 和发布设置都集中在这一页维护，保存草稿后可直接进入独立预览页检查阅读效果。
          </p>
        </div>

        <div class="create-article-hero__stats">
          <article>
            <strong>{{ metaStats.wordCount }}</strong>
            <span>当前字数</span>
          </article>
          <article>
            <strong>{{ metaStats.readMinutes }} min</strong>
            <span>预计阅读</span>
          </article>
          <article>
            <strong>{{ draft.tags.length }}</strong>
            <span>标签数量</span>
          </article>
        </div>
      </header>

      <p v-if="autoSaving" class="auto-save-tip">草稿自动保存中...</p>

      <div class="preview-toggle">
        <button type="button" class="editor-btn" @click="previewVisible = !previewVisible">
          {{ previewVisible ? '收起预览' : '展开预览' }}
        </button>
        <button type="button" class="editor-btn editor-btn--ghost" @click="openPreviewPage">
          独立预览页
        </button>
      </div>

      <section v-if="previewVisible" class="preview-panel">
        <div class="preview-panel__meta">
          <span>{{ draft.category || '未分类' }}</span>
          <span>{{ draft.publishTime || '未设置发布时间' }}</span>
          <span>{{ metaStats.readMinutes }} min read</span>
        </div>
        <h2>{{ draft.title || '未命名文章' }}</h2>
        <p class="preview-panel__summary">{{ draft.summary || '这里会显示文章摘要预览。' }}</p>
        <img v-if="draft.cover" :src="draft.cover" alt="文章预览封面" class="preview-panel__cover" />
        <div class="preview-panel__tags">
          <span v-for="tag in draft.tags" :key="tag">{{ tag }}</span>
        </div>
        <article class="preview-panel__content">
          <p v-for="paragraph in draft.content.split('\n').filter(Boolean)" :key="paragraph">{{ paragraph }}</p>
          <p v-if="!draft.content.trim()">这里会实时预览正文内容。</p>
        </article>
      </section>

      <div class="create-article-layout">
        <section class="editor-panel">
          <article class="editor-card">
            <div class="editor-card__header">
              <div>
                <p>基础信息</p>
                <h2>文章标题、摘要和封面</h2>
              </div>
              <span class="editor-card__badge">必填优先</span>
            </div>

            <div class="editor-grid editor-grid--single">
              <label class="editor-field">
                <span>文章标题</span>
                <input v-model="draft.title" type="text" placeholder="例如：从前端视角理解 Go 服务端分层设计" />
              </label>

              <label class="editor-field">
                <span>文章摘要</span>
                <textarea
                  v-model="draft.summary"
                  rows="4"
                  placeholder="写一段会出现在文章列表里的摘要，让游客快速理解这篇文章的重点。"
                ></textarea>
              </label>

              <div class="editor-cover">
                <div class="editor-cover__preview">
                  <img
                    v-if="draft.cover"
                    :src="draft.cover"
                    alt="文章封面预览"
                  />
                  <div v-else class="editor-cover__placeholder">
                    <strong>封面预览</strong>
                    <span>建议上传 16:9 比例图片</span>
                  </div>
                </div>

                <div class="editor-cover__actions">
                  <label class="editor-btn editor-btn--solid editor-btn--file">
                    上传封面
                    <input type="file" accept="image/*" @change="handleCoverUpload" />
                  </label>
                  <input
                    v-model="draft.cover"
                    type="text"
                    placeholder="或者直接输入封面图片 URL"
                  />
                </div>
              </div>
            </div>
          </article>

          <article class="editor-card">
            <div class="editor-card__header">
              <div>
                <p>正文内容</p>
                <h2>分类、标签和正文编辑</h2>
              </div>
              <span class="editor-card__badge">核心编辑区</span>
            </div>

            <div class="editor-grid editor-grid--double">
              <label class="editor-field">
                <span>文章分类</span>
                <select v-model="draft.category">
                  <option value="frontend">前端工程</option>
                  <option value="golang">Go 后端</option>
                  <option value="notes">学习笔记</option>
                  <option value="product">产品思考</option>
                </select>
              </label>

              <label class="editor-field">
                <span>编辑器类型</span>
                <select v-model="draft.contentType">
                  <option value="markdown">Markdown</option>
                  <option value="richtext">Rich Text</option>
                </select>
              </label>
            </div>

            <div class="chip-editor">
              <div class="chip-editor__header">
                <span>文章标签</span>
                <small>建议 3 到 5 个</small>
              </div>

              <div class="chip-editor__input">
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="输入标签后回车或点击添加"
                  @keydown.enter.prevent="addTag"
                />
                <button type="button" class="editor-btn editor-btn--solid" @click="addTag">添加标签</button>
              </div>

              <div class="chip-editor__list">
                <button
                  v-for="tag in draft.tags"
                  :key="tag"
                  type="button"
                  class="chip-editor__chip"
                  @click="removeTag(tag)"
                >
                  {{ tag }}
                  <span>×</span>
                </button>
              </div>
            </div>

            <label class="editor-field">
              <span>正文内容</span>
              <textarea
                v-model="draft.content"
                rows="16"
                class="editor-field__content"
                placeholder="在这里开始创作正文内容。后续接真实编辑器时，可以替换成 Markdown 编辑器或富文本编辑器。"
              ></textarea>
            </label>
          </article>
        </section>

        <aside class="settings-panel">
          <article class="editor-card">
            <div class="editor-card__header">
              <div>
                <p>发布设置</p>
                <h2>状态与展示控制</h2>
              </div>
            </div>

            <div class="status-switch">
              <button
                type="button"
                class="status-switch__item"
                :class="{ 'status-switch__item--active': draft.status === 'draft' }"
                @click="draft.status = 'draft'"
              >
                草稿
              </button>
              <button
                type="button"
                class="status-switch__item"
                :class="{ 'status-switch__item--active': draft.status === 'public' }"
                @click="draft.status = 'public'"
              >
                公开
              </button>
              <button
                type="button"
                class="status-switch__item"
                :class="{ 'status-switch__item--active': draft.status === 'private' }"
                @click="draft.status = 'private'"
              >
                私密
              </button>
            </div>

            <label class="editor-field">
              <span>发布时间</span>
              <input v-model="draft.publishTime" type="datetime-local" />
            </label>

            <label class="switch-field">
              <input v-model="draft.allowComment" type="checkbox" />
              <div>
                <strong>允许评论</strong>
                <span>游客可在详情页参与评论互动</span>
              </div>
            </label>

            <label class="switch-field">
              <input v-model="draft.isRecommend" type="checkbox" />
              <div>
                <strong>推荐文章</strong>
                <span>后续可在首页或公开文章页做推荐展示</span>
              </div>
            </label>

            <label class="switch-field">
              <input v-model="draft.isTop" type="checkbox" />
              <div>
                <strong>置顶展示</strong>
                <span>用于作者首页或后台管理优先展示</span>
              </div>
            </label>
          </article>

          <article class="editor-card">
            <div class="editor-card__header">
              <div>
                <p>SEO 设置</p>
                <h2>搜索与分享展示</h2>
              </div>
            </div>

            <label class="editor-field">
              <span>SEO 标题</span>
              <input v-model="draft.seoTitle" type="text" placeholder="不填则默认使用文章标题" />
            </label>

            <label class="editor-field">
              <span>SEO 描述</span>
              <textarea
                v-model="draft.seoDescription"
                rows="4"
                placeholder="用于搜索结果摘要和分享文案描述。"
              ></textarea>
            </label>

            <div class="chip-editor">
              <div class="chip-editor__header">
                <span>SEO 关键词</span>
                <small>可选补充</small>
              </div>

              <div class="chip-editor__input">
                <input
                  v-model="keywordInput"
                  type="text"
                  placeholder="输入关键词后回车或点击添加"
                  @keydown.enter.prevent="addKeyword"
                />
                <button type="button" class="editor-btn editor-btn--solid" @click="addKeyword">添加关键词</button>
              </div>

              <div class="chip-editor__list">
                <button
                  v-for="keyword in draft.seoKeywords"
                  :key="keyword"
                  type="button"
                  class="chip-editor__chip chip-editor__chip--light"
                  @click="removeKeyword(keyword)"
                >
                  {{ keyword }}
                  <span>×</span>
                </button>
              </div>
            </div>
          </article>

          <article class="editor-card editor-card--summary">
            <div class="editor-card__header">
              <div>
                <p>当前状态</p>
                <h2>保存与发布</h2>
              </div>
            </div>

            <ul class="summary-list">
              <li>标题长度：{{ draft.title.trim().length }}</li>
              <li>摘要长度：{{ metaStats.summaryLength }}</li>
              <li>标签数量：{{ draft.tags.length }}</li>
              <li>最近保存：{{ draft.lastSavedAt ? draft.lastSavedAt.replace('T', ' ').slice(0, 16) : '尚未保存' }}</li>
            </ul>

            <p v-if="feedbackMessage" class="editor-feedback">{{ feedbackMessage }}</p>

            <div class="editor-actions">
              <button type="button" class="editor-btn" :disabled="saving" @click="resetDraft">重置内容</button>
              <button type="button" class="editor-btn" :disabled="saving" @click="persistDraft()">保存草稿</button>
              <button
                type="button"
                class="editor-btn editor-btn--solid editor-btn--wide"
                :disabled="publishing"
                @click="publishArticle"
              >
                {{ publishing ? '发布中...' : '发布文章' }}
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  </main>
</template>

<style scoped>
.create-article-page {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.create-article-shell {
  display: grid;
  gap: var(--space-xl);
}

.preview-toggle {
  display: flex;
  justify-content: flex-end;
  gap: .65rem;
}

.auto-save-tip {
  margin: 0;
  color: var(--color-text-secondary);
  text-align: right;
  font-size: .88rem;
}

.preview-panel {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.82);
  box-shadow: var(--shadow-soft);
}

.preview-panel__meta,
.preview-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
}

.preview-panel__meta span,
.preview-panel__tags span {
  padding: .42rem .72rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  font-size: .82rem;
}

.preview-panel h2 {
  color: var(--color-text-strong);
  font-size: clamp(2rem, 4vw, 3rem);
}

.preview-panel__summary {
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.preview-panel__cover {
  width: 100%;
  max-height: 24rem;
  object-fit: cover;
  border-radius: var(--radius-2xl);
}

.preview-panel__content {
  color: var(--color-text-strong);
  line-height: 1.9;
}

.preview-panel__content p + p {
  margin-top: .9rem;
}

.create-article-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
  gap: var(--space-xl);
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at 18% 20%, rgba(247, 193, 70, 0.22), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(110, 209, 245, 0.18), transparent 28%),
    linear-gradient(145deg, rgba(9, 24, 38, 0.97), rgba(18, 44, 68, 0.94));
  box-shadow: var(--shadow-hero);
}

.create-article-hero__eyebrow {
  color: var(--color-accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: var(--font-size-caption);
}

.create-article-hero h1 {
  margin-top: var(--space-sm);
  color: var(--color-surface);
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.02;
}

.create-article-hero__description {
  margin-top: var(--space-md);
  color: var(--color-text-inverse-soft);
  font-size: var(--font-size-lg);
  line-height: 1.8;
}

.create-article-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
  align-self: end;
}

.create-article-hero__stats article {
  padding: var(--space-lg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.08);
}

.create-article-hero__stats strong {
  display: block;
  color: var(--color-surface);
  font-size: 1.5rem;
}

.create-article-hero__stats span {
  display: block;
  margin-top: var(--space-xs);
  color: var(--color-text-inverse-soft);
  font-size: 0.86rem;
}

.create-article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.82fr);
  gap: var(--space-xl);
}

.editor-panel,
.settings-panel {
  display: grid;
  gap: var(--space-xl);
  align-content: start;
}

.editor-card {
  padding: var(--space-xl);
  border: 1px solid var(--color-border-warm);
  border-radius: var(--radius-3xl);
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.95), rgba(255, 248, 238, 0.88));
  box-shadow: var(--shadow-soft);
}

.editor-card__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.editor-card__header p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.editor-card__header h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
  font-size: 1.35rem;
}

.editor-card__badge {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.editor-grid {
  display: grid;
  gap: var(--space-lg);
}

.editor-grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.editor-field {
  display: grid;
  gap: 0.55rem;
}

.editor-field span {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.editor-field input,
.editor-field select,
.editor-field textarea,
.editor-cover__actions input,
.chip-editor__input input {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  outline: none;
  padding: 0.82rem 0.95rem;
  color: var(--color-text-strong);
  font: inherit;
  transition: border-color var(--motion-base) ease, box-shadow var(--motion-base) ease;
}

.editor-field textarea,
.editor-field__content {
  resize: vertical;
  line-height: 1.7;
}

.editor-field input:focus,
.editor-field select:focus,
.editor-field textarea:focus,
.editor-cover__actions input:focus,
.chip-editor__input input:focus {
  border-color: rgba(214, 142, 52, 0.48);
  box-shadow: 0 0 0 4px rgba(214, 142, 52, 0.1);
}

.editor-cover {
  display: grid;
  gap: var(--space-md);
}

.editor-cover__preview {
  overflow: hidden;
  border-radius: var(--radius-2xl);
  min-height: 16rem;
  background: linear-gradient(145deg, rgba(16, 42, 67, 0.06), rgba(247, 193, 70, 0.1));
}

.editor-cover__preview img {
  display: block;
  width: 100%;
  height: 16rem;
  object-fit: cover;
}

.editor-cover__placeholder {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.4rem;
  height: 100%;
  min-height: 16rem;
  color: var(--color-text-secondary);
}

.editor-cover__actions {
  display: grid;
  gap: var(--space-sm);
}

.chip-editor {
  display: grid;
  gap: var(--space-sm);
}

.chip-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.chip-editor__header span {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.chip-editor__header small {
  color: var(--color-text-secondary);
}

.chip-editor__input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-sm);
}

.chip-editor__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.chip-editor__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  padding: 0.45rem 0.78rem;
  font: inherit;
  cursor: pointer;
}

.chip-editor__chip--light {
  background: rgba(214, 142, 52, 0.12);
  color: var(--color-accent-deep);
}

.status-switch {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin-bottom: var(--space-lg);
}

.status-switch__item {
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-text-secondary);
  padding: 0.72rem 0.8rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--motion-base) ease, background-color var(--motion-base) ease, color var(--motion-base) ease;
}

.status-switch__item--active {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  box-shadow: var(--shadow-card);
}

.switch-field {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border-soft);
}

.switch-field:last-of-type {
  border-bottom: 0;
}

.switch-field input {
  margin-top: 0.2rem;
}

.switch-field strong {
  display: block;
  color: var(--color-text-strong);
}

.switch-field span {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.summary-list {
  display: grid;
  gap: 0.7rem;
  padding-left: 1.1rem;
  margin: 0;
  color: var(--color-text-secondary);
}

.editor-feedback {
  margin-top: var(--space-md);
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  background: rgba(214, 142, 52, 0.12);
  color: var(--color-accent-deep);
  font-size: 0.92rem;
}

.editor-actions {
  display: grid;
  gap: 0.75rem;
  margin-top: var(--space-lg);
}

.editor-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  padding: 0.82rem 1.1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--motion-base) ease, opacity var(--motion-base) ease, background-color var(--motion-base) ease;
}

.editor-btn:hover {
  transform: translateY(-1px);
}

.editor-btn:disabled {
  opacity: 0.72;
  cursor: wait;
  transform: none;
}

.editor-btn--solid {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  box-shadow: var(--shadow-card);
}

.editor-btn--ghost {
  background: rgba(255, 255, 255, 0.82);
}

.editor-btn--wide {
  width: 100%;
}

.editor-btn--file {
  position: relative;
  overflow: hidden;
}

.editor-btn--file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

@media (max-width: 1080px) {
  .create-article-layout,
  .create-article-hero {
    grid-template-columns: 1fr;
  }

  .create-article-hero__stats,
  .editor-grid--double {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .create-article-page {
    width: min(100% - 20px, 1280px);
    padding: 88px 0 40px;
  }

  .create-article-hero,
  .editor-card {
    padding: var(--space-lg);
  }

  .chip-editor__input {
    grid-template-columns: 1fr;
  }
}
</style>
