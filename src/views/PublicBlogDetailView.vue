<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HomeFooter from '../components/home/HomeFooter.vue'
import HomeNav from '../components/home/HomeNav.vue'
import { homeFooter, homeNav } from '../data/home'
import { createPublicArticleComment, deletePublicArticleComment, getPublicArticleComments, getPublicBlogArticleDetail } from '../services/blog'
import {
  getPublicBlogArticleActionState,
  increasePublicBlogArticleShare,
  togglePublicBlogArticleCollect,
  togglePublicBlogArticleLike,
} from '../services/blogInteraction'
import { useAuthStore } from '../stores/auth'
import type { PublicBlogArticleActionState, PublicBlogArticleDetail, PublicComment } from '../types/blog'
import type { HomeNavUser } from '../types/home'

interface NestedComment extends PublicComment {
  replies: PublicComment[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const article = ref<PublicBlogArticleDetail | null>(null)
const commentInput = ref('')
const comments = ref<PublicComment[]>([])
const commentPage = ref(1)
const commentPageSize = 10
const hasMoreComments = ref(false)
const totalComments = ref(0)
const loadingMoreComments = ref(false)
const commentSort = ref<'latest' | 'oldest'>('latest')
const replyTarget = ref<PublicComment | null>(null)
const deletingCommentId = ref('')
const actionState = ref<PublicBlogArticleActionState | null>(null)
const highlightedCommentId = ref('')
const submittingComment = ref(false)
const commentSubmitMessage = ref('')
const commentSectionRef = ref<HTMLElement | null>(null)
const commentTextareaRef = ref<HTMLTextAreaElement | null>(null)

function getCommentDraftStorageKey() {
  return `wm-blog-comment-draft:${String(route.params.id || '')}`
}

function restoreCommentDraft() {
  if (typeof window === 'undefined') {
    return
  }

  const cachedDraft = window.localStorage.getItem(getCommentDraftStorageKey())
  if (cachedDraft) {
    commentInput.value = cachedDraft
  }
}

function persistCommentDraft(content: string) {
  if (typeof window === 'undefined') {
    return
  }

  const draftKey = getCommentDraftStorageKey()
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    window.localStorage.removeItem(draftKey)
    return
  }

  window.localStorage.setItem(draftKey, content)
}

function scrollToCommentSection() {
  commentSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function focusCommentEditor() {
  window.setTimeout(() => {
    commentTextareaRef.value?.focus()
  }, 180)
}

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

const canComment = computed(() => authStore.isLoggedIn)
const nestedComments = computed<NestedComment[]>(() => {
  const commentMap = new Map<string, NestedComment>()
  const rootComments: NestedComment[] = []

  comments.value.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    })
  })

  comments.value.forEach((comment) => {
    const currentComment = commentMap.get(comment.id)
    if (!currentComment) {
      return
    }

    if (comment.parentId) {
      const parentComment = commentMap.get(comment.parentId)
      if (parentComment) {
        parentComment.replies.push(currentComment)
        return
      }
    }

    rootComments.push(currentComment)
  })

  return rootComments
})

async function loadArticle() {
  try {
    article.value = await getPublicBlogArticleDetail(String(route.params.id || ''))
    const commentData = await getPublicArticleComments(
      String(route.params.id || ''),
      1,
      commentPageSize,
      commentSort.value,
    )
    comments.value = commentData.list
    commentPage.value = commentData.page
    hasMoreComments.value = commentData.hasMore
    totalComments.value = commentData.total
    actionState.value = await getPublicBlogArticleActionState(String(route.params.id || ''), 0)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  restoreCommentDraft()
  loadArticle()
})

watch(
  () => commentInput.value,
  (value) => {
    persistCommentDraft(value)
  },
)

async function submitComment() {
  if (!authStore.user || submittingComment.value) {
    return
  }

  const content = commentInput.value.trim()
  if (!content) {
    commentSubmitMessage.value = '评论内容不能为空。'
    return
  }

  submittingComment.value = true
  commentSubmitMessage.value = ''

  try {
    const nextComment = await createPublicArticleComment(String(route.params.id || ''), {
      authorId: authStore.user?.id,
      authorName: authStore.user?.name || '游客',
      content,
      parentId: replyTarget.value?.id,
    })
    comments.value.unshift(nextComment)
    highlightedCommentId.value = nextComment.id
    window.setTimeout(() => {
      if (highlightedCommentId.value === nextComment.id) {
        highlightedCommentId.value = ''
      }
    }, 2200)
    totalComments.value += 1
    if (actionState.value) {
      actionState.value = {
        ...actionState.value,
        commentCount: actionState.value.commentCount + 1,
      }
    }
    commentInput.value = ''
    persistCommentDraft('')
    replyTarget.value = null
    commentSubmitMessage.value = '评论发布成功。'
    window.setTimeout(() => {
      if (commentSubmitMessage.value === '评论发布成功。') {
        commentSubmitMessage.value = ''
      }
    }, 1800)
  } catch (error) {
    const nextMessage =
      typeof error === 'object' && error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
        : ''

    commentSubmitMessage.value = nextMessage || '评论发布失败，请稍后重试。'
  } finally {
    submittingComment.value = false
  }
}

async function loadMoreComments() {
  if (!hasMoreComments.value || loadingMoreComments.value) {
    return
  }

  loadingMoreComments.value = true

  try {
    const nextPage = commentPage.value + 1
    const commentData = await getPublicArticleComments(
      String(route.params.id || ''),
      nextPage,
      commentPageSize,
      commentSort.value,
    )
    comments.value = [...comments.value, ...commentData.list]
    commentPage.value = commentData.page
    hasMoreComments.value = commentData.hasMore
    totalComments.value = commentData.total
  } finally {
    loadingMoreComments.value = false
  }
}

async function handleCommentSortChange(sort: 'latest' | 'oldest') {
  if (commentSort.value === sort) {
    return
  }

  commentSort.value = sort
  loadingMoreComments.value = true

  try {
    const commentData = await getPublicArticleComments(
      String(route.params.id || ''),
      1,
      commentPageSize,
      commentSort.value,
    )
    comments.value = commentData.list
    commentPage.value = commentData.page
    hasMoreComments.value = commentData.hasMore
    totalComments.value = commentData.total
    replyTarget.value = null
  } finally {
    loadingMoreComments.value = false
  }
}

function handleReply(comment: PublicComment) {
  replyTarget.value = comment
  scrollToCommentSection()
  focusCommentEditor()
}

function canDeleteComment(comment: PublicComment) {
  if (!authStore.user) {
    return false
  }

  return authStore.user.role === 'admin' || authStore.user.id === comment.authorId
}

async function removeComment(commentId: string) {
  const targetComment = comments.value.find((comment) => comment.id === commentId)
  if (!targetComment || !canDeleteComment(targetComment)) {
    return
  }

  if (!window.confirm('确认删除这条评论吗？删除后不可恢复。')) {
    return
  }

  deletingCommentId.value = commentId
  commentSubmitMessage.value = ''

  try {
    await deletePublicArticleComment(String(route.params.id || ''), commentId)
    comments.value = comments.value.filter((comment) => comment.id !== commentId)
    totalComments.value = Math.max(0, totalComments.value - 1)
    if (actionState.value) {
      actionState.value = {
        ...actionState.value,
        commentCount: Math.max(0, actionState.value.commentCount - 1),
      }
    }
    commentSubmitMessage.value = '评论已删除。'
    window.setTimeout(() => {
      if (commentSubmitMessage.value === '评论已删除。') {
        commentSubmitMessage.value = ''
      }
    }, 1800)
  } catch (error) {
    const nextMessage =
      typeof error === 'object' && error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
        : ''

    commentSubmitMessage.value = nextMessage || '评论删除失败，请稍后重试。'
  } finally {
    deletingCommentId.value = ''
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push('/wm/blog')
}

async function ensureAuthForInteraction() {
  if (authStore.isLoggedIn) {
    return true
  }

  await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
  return false
}

async function handleLike() {
  if (!article.value || !(await ensureAuthForInteraction())) {
    return
  }

  actionState.value = await togglePublicBlogArticleLike(article.value.id)
}

async function handleCollect() {
  if (!article.value || !(await ensureAuthForInteraction())) {
    return
  }

  actionState.value = await togglePublicBlogArticleCollect(article.value.id)
}

async function handleShare() {
  if (!article.value) {
    return
  }

  if (typeof window !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/wm/blog/${article.value.id}`)
    } catch {
      // 复制失败时继续更新分享数。
    }
  }

  actionState.value = await increasePublicBlogArticleShare(article.value.id)
}

function handleCommentEntry() {
  scrollToCommentSection()
}

async function handleCommentKeydown(event: KeyboardEvent) {
  if (!canComment.value || submittingComment.value) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    await submitComment()
  }
}
</script>

<template>
  <main class="blog-detail-page">
    <HomeNav :nav="homeNav" :current-user="currentUser" @logout="handleLogout" />

    <section v-if="loading" class="blog-detail-loading">文章详情加载中...</section>

    <section v-else-if="article" class="blog-detail-shell">
      <header class="blog-detail-hero">
        <div class="blog-detail-hero__meta">
          <span>{{ article.category }}</span>
          <span>{{ article.publishDate }}</span>
          <span>{{ article.readTime }}</span>
        </div>
        <h1>{{ article.title }}</h1>
        <p>{{ article.summary }}</p>
        <div class="blog-detail-author">
          <span class="blog-detail-author__avatar">{{ article.author.avatarText }}</span>
          <div>
            <strong>{{ article.author.name }}</strong>
            <small>{{ article.author.role }}</small>
          </div>
        </div>
      </header>

      <img :src="article.image" :alt="article.title" class="blog-detail-cover" />

      <div class="blog-detail-layout">
        <article class="blog-detail-content">
          <div class="blog-detail-actions">
            <button
              type="button"
              class="blog-detail-actions__item"
              :class="{ 'blog-detail-actions__item--active': actionState?.liked }"
              @click="handleLike"
            >
              点赞 {{ actionState?.likeCount ?? article.stats.likes }}
            </button>
            <button
              type="button"
              class="blog-detail-actions__item"
              :class="{ 'blog-detail-actions__item--active': actionState?.collected }"
              @click="handleCollect"
            >
              收藏 {{ actionState?.collectCount ?? article.stats.collects }}
            </button>
            <button type="button" class="blog-detail-actions__item" @click="handleCommentEntry">
              评论 {{ actionState?.commentCount ?? article.stats.comments }}
            </button>
            <button type="button" class="blog-detail-actions__item" @click="handleShare">
              分享 {{ actionState?.shareCount ?? article.stats.shares }}
            </button>
          </div>

          <p
            v-for="paragraph in article.content.split('\n').filter(Boolean)"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </article>

        <aside class="blog-detail-side">
          <article class="blog-detail-card">
            <p>互动数据</p>
            <h2>文章状态</h2>
            <ul>
              <li>点赞：{{ article.stats.likes }}</li>
              <li>收藏：{{ article.stats.collects }}</li>
              <li>评论：{{ article.stats.comments }}</li>
              <li>分享：{{ article.stats.shares }}</li>
            </ul>
          </article>

          <article class="blog-detail-card">
            <p>标签</p>
            <h2>文章主题</h2>
            <div class="blog-detail-tags">
              <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </aside>
      </div>

      <section id="comments" ref="commentSectionRef" class="blog-comment-panel">
        <div class="blog-comment-panel__header">
          <div>
            <p>Comments</p>
            <h2>评论区骨架</h2>
          </div>
          <div class="blog-comment-panel__tools">
            <span>{{ totalComments }} 条评论</span>
            <div class="blog-comment-panel__sort">
              <button
                type="button"
                :class="{ 'blog-comment-panel__sort-btn--active': commentSort === 'latest' }"
                @click="handleCommentSortChange('latest')"
              >
                最新优先
              </button>
              <button
                type="button"
                :class="{ 'blog-comment-panel__sort-btn--active': commentSort === 'oldest' }"
                @click="handleCommentSortChange('oldest')"
              >
                最早优先
              </button>
            </div>
          </div>
        </div>

        <div class="blog-comment-editor">
          <p v-if="!canComment" class="blog-comment-editor__login-tip">
            登录后可发表评论、回复和删除自己的评论。
          </p>
          <p v-if="replyTarget" class="blog-comment-editor__replying">
            正在回复 {{ replyTarget.authorName }}
            <button type="button" @click="replyTarget = null">取消</button>
          </p>
          <textarea
            ref="commentTextareaRef"
            v-model="commentInput"
            rows="4"
            :disabled="!canComment || submittingComment"
            placeholder="写下你对这篇文章的看法，输入内容会自动暂存在本地。"
            @keydown="handleCommentKeydown"
          ></textarea>
          <p
            v-if="commentSubmitMessage"
            class="blog-comment-editor__feedback"
            :class="{
              'blog-comment-editor__feedback--success':
                commentSubmitMessage === '评论发布成功。' || commentSubmitMessage === '评论已删除。',
            }"
          >
            {{ commentSubmitMessage }}
          </p>
          <p class="blog-comment-editor__shortcut">快捷键：`Ctrl + Enter` / `Command + Enter` 提交评论，未发送内容会自动暂存</p>
          <button
            type="button"
            class="blog-comment-editor__submit"
            :disabled="!canComment || submittingComment"
            @click="submitComment"
          >
            {{ submittingComment ? '发布中...' : '发表评论' }}
          </button>
        </div>

        <div v-if="comments.length === 0" class="blog-comment-empty">
          <strong>还没有评论</strong>
          <p>如果你是第一个看到这篇文章的人，可以先留下第一条看法。</p>
        </div>

        <div v-else class="blog-comment-list">
          <article
            v-for="comment in nestedComments"
            :key="comment.id"
            class="blog-comment-card"
            :class="{ 'blog-comment-card--highlight': highlightedCommentId === comment.id }"
          >
            <div class="blog-comment-card__head">
              <strong>
                {{ comment.authorName }}
                <span v-if="comment.replyToAuthor" class="blog-comment-card__reply-label">
                  回复 {{ comment.replyToAuthor }}
                </span>
              </strong>
              <span>{{ comment.publishTime }}</span>
            </div>
            <p>{{ comment.content }}</p>
            <div class="blog-comment-card__actions">
              <button type="button" :disabled="!canComment" @click="handleReply(comment)">回复</button>
              <button
                v-if="canDeleteComment(comment)"
                type="button"
                :disabled="deletingCommentId === comment.id"
                @click="removeComment(comment.id)"
              >
                {{ deletingCommentId === comment.id ? '删除中...' : '删除' }}
              </button>
            </div>

            <div v-if="comment.replies.length" class="blog-comment-card__replies">
              <article
                v-for="reply in comment.replies"
                :key="reply.id"
                class="blog-comment-reply"
                :class="{ 'blog-comment-reply--highlight': highlightedCommentId === reply.id }"
              >
                <div class="blog-comment-card__head">
                  <strong>
                    {{ reply.authorName }}
                    <span v-if="reply.replyToAuthor" class="blog-comment-card__reply-label">
                      回复 {{ reply.replyToAuthor }}
                    </span>
                  </strong>
                  <span>{{ reply.publishTime }}</span>
                </div>
                <p>{{ reply.content }}</p>
                <div class="blog-comment-card__actions">
                  <button type="button" :disabled="!canComment" @click="handleReply(reply)">回复</button>
                  <button
                    v-if="canDeleteComment(reply)"
                    type="button"
                    :disabled="deletingCommentId === reply.id"
                    @click="removeComment(reply.id)"
                  >
                    {{ deletingCommentId === reply.id ? '删除中...' : '删除' }}
                  </button>
                </div>
              </article>
            </div>
          </article>
        </div>

        <div v-if="hasMoreComments" class="blog-comment-panel__more">
          <button type="button" class="blog-comment-editor__submit" :disabled="loadingMoreComments" @click="loadMoreComments">
            {{ loadingMoreComments ? '加载中...' : '加载更多评论' }}
          </button>
        </div>
      </section>

      <section v-if="article.previous || article.next" class="blog-detail-neighbors">
        <RouterLink
          v-if="article.previous"
          :to="`/wm/blog/${article.previous.id}`"
          class="blog-detail-neighbors__item"
        >
          <p>上一篇</p>
          <h3>{{ article.previous.title }}</h3>
          <span>{{ article.previous.category }} · {{ article.previous.publishDate }} · {{ article.previous.readTime }}</span>
        </RouterLink>

        <RouterLink
          v-if="article.next"
          :to="`/wm/blog/${article.next.id}`"
          class="blog-detail-neighbors__item blog-detail-neighbors__item--next"
        >
          <p>下一篇</p>
          <h3>{{ article.next.title }}</h3>
          <span>{{ article.next.category }} · {{ article.next.publishDate }} · {{ article.next.readTime }}</span>
        </RouterLink>
      </section>

      <section v-if="article.related?.length" class="blog-detail-related">
        <div class="blog-detail-related__heading">
          <p>Related Reading</p>
          <h2>相关推荐</h2>
        </div>

        <div class="blog-detail-related__grid">
          <RouterLink
            v-for="relatedArticle in article.related"
            :key="relatedArticle.id"
            :to="`/wm/blog/${relatedArticle.id}`"
            class="blog-detail-related__item"
          >
            <img :src="relatedArticle.image" :alt="relatedArticle.title" class="blog-detail-related__image" />
            <div class="blog-detail-related__body">
              <div class="blog-detail-related__meta">
                <span>{{ relatedArticle.category }}</span>
                <span>{{ relatedArticle.readTime }}</span>
              </div>
              <h3>{{ relatedArticle.title }}</h3>
              <p>{{ relatedArticle.summary }}</p>
            </div>
          </RouterLink>
        </div>
      </section>

      <HomeFooter :footer="homeFooter" />
    </section>
  </main>
</template>

<style scoped>
.blog-detail-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}
.blog-detail-loading {
  min-height: 50vh;
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
}
.blog-detail-neighbors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}
.blog-detail-neighbors__item {
  display: grid;
  gap: 0.55rem;
  padding: 1.2rem 1.3rem;
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.86);
  box-shadow: var(--shadow-soft);
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}
.blog-detail-neighbors__item:hover {
  transform: translateY(-2px);
}
.blog-detail-neighbors__item p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.blog-detail-neighbors__item h3 {
  color: var(--color-text-strong);
}
.blog-detail-neighbors__item span {
  color: var(--color-text-secondary);
}
.blog-detail-neighbors__item--next {
  text-align: right;
}
.blog-detail-related {
  display: grid;
  gap: var(--space-lg);
}
.blog-detail-related__heading p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.blog-detail-related__heading h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}
.blog-detail-related__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}
.blog-detail-related__item {
  display: grid;
  overflow: hidden;
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.86);
  box-shadow: var(--shadow-soft);
  text-decoration: none;
  transition: transform 180ms ease;
}
.blog-detail-related__item:hover {
  transform: translateY(-2px);
}
.blog-detail-related__image {
  width: 100%;
  height: 11rem;
  object-fit: cover;
}
.blog-detail-related__body {
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.05rem 1.15rem;
}
.blog-detail-related__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--color-accent-deep);
  font-size: 0.8rem;
}
.blog-detail-related__body h3 {
  color: var(--color-text-strong);
}
.blog-detail-related__body p {
  color: var(--color-text-secondary);
  line-height: 1.7;
}
.blog-detail-shell {
  display: grid;
  gap: var(--space-xl);
}
.blog-detail-hero,
.blog-detail-card,
.blog-detail-content,
.blog-comment-panel {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.82);
  box-shadow: var(--shadow-soft);
}
.blog-detail-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
  color: var(--color-accent-deep);
}
.blog-detail-hero h1 {
  margin-top: var(--space-sm);
  font-size: clamp(2.4rem, 6vw, 4rem);
  line-height: 1.04;
  color: var(--color-text-strong);
}
.blog-detail-hero p {
  margin-top: var(--space-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.8;
}
.blog-detail-author {
  margin-top: var(--space-lg);
  display: inline-flex;
  align-items: center;
  gap: .85rem;
}
.blog-detail-author__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: linear-gradient(145deg, rgba(247, 193, 70, 0.92), rgba(214, 142, 52, 1));
  font-weight: 800;
}
.blog-detail-cover {
  width: 100%;
  height: 30rem;
  object-fit: cover;
  border-radius: calc(var(--radius-3xl) + 0.25rem);
  box-shadow: var(--shadow-card);
}
.blog-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(18rem, .8fr);
  gap: var(--space-xl);
}
.blog-detail-content p + p {
  margin-top: 1rem;
}
.blog-detail-content p {
  color: var(--color-text-strong);
  line-height: 1.9;
}
.blog-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
  margin-bottom: 1.15rem;
}
.blog-detail-actions__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: .62rem .9rem;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  font: inherit;
  font-weight: 700;
}
.blog-detail-actions__item--active {
  background: rgba(214, 142, 52, 0.16);
  color: var(--color-accent-deep);
}
.blog-detail-side {
  display: grid;
  gap: var(--space-xl);
  align-content: start;
}
.blog-detail-card p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}
.blog-detail-card h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
  font-size: 1.2rem;
}
.blog-detail-card ul {
  margin: var(--space-md) 0 0;
  padding-left: 1.1rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: .6rem;
}
.blog-detail-tags {
  margin-top: var(--space-md);
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
}
.blog-detail-tags span {
  padding: .45rem .72rem;
  border-radius: 999px;
  background: rgba(16,42,67,.08);
  color: var(--color-primary);
  font-size: .84rem;
}
.blog-comment-panel__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  align-items: start;
}
.blog-comment-panel__header p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}
.blog-comment-panel__header h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}
.blog-comment-panel__header span {
  color: var(--color-text-secondary);
}
.blog-comment-panel__tools {
  display: grid;
  justify-items: end;
  gap: 0.6rem;
}
.blog-comment-panel__sort {
  display: inline-flex;
  gap: 0.45rem;
  padding: 0.28rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.06);
}
.blog-comment-panel__sort button {
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}
.blog-comment-panel__sort-btn--active {
  background: rgba(214, 142, 52, 0.16) !important;
  color: var(--color-accent-deep) !important;
  font-weight: 700;
}
.blog-comment-editor {
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}
.blog-comment-editor__login-tip {
  color: var(--color-text-secondary);
  font-size: .92rem;
}
.blog-comment-editor__shortcut {
  color: var(--color-text-secondary);
  font-size: .84rem;
}
.blog-comment-editor__feedback {
  color: #b54708;
  font-size: .88rem;
}
.blog-comment-editor__feedback--success {
  color: #1d6b45;
}
.blog-comment-editor__replying {
  display: flex;
  align-items: center;
  gap: .6rem;
  color: var(--color-accent-deep);
}
.blog-comment-editor__replying button,
.blog-comment-card__actions button {
  border: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
.blog-comment-editor textarea {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.12);
  border-radius: 1rem;
  background: rgba(255,255,255,.86);
  outline: none;
  padding: .92rem 1rem;
  font: inherit;
  resize: vertical;
}
.blog-comment-editor__submit {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  padding: .72rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.blog-comment-editor__submit:disabled,
.blog-comment-card__actions button:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.blog-comment-list {
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}
.blog-comment-empty {
  display: grid;
  gap: 0.45rem;
  margin-top: var(--space-lg);
  padding: 1.2rem 1.25rem;
  border-radius: var(--radius-2xl);
  background: rgba(16, 42, 67, 0.04);
  color: var(--color-text-secondary);
}
.blog-comment-empty strong {
  color: var(--color-text-strong);
}
.blog-comment-card {
  padding: 1rem 1.05rem;
  border-radius: var(--radius-2xl);
  background: rgba(16,42,67,.05);
  transition:
    background 240ms ease,
    box-shadow 240ms ease,
    transform 240ms ease;
}
.blog-comment-card--highlight {
  background: rgba(247, 193, 70, 0.14);
  box-shadow: 0 18px 36px rgba(214, 142, 52, 0.12);
  transform: translateY(-1px);
}
.blog-comment-card__replies {
  display: grid;
  gap: .75rem;
  margin-top: .9rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(214, 142, 52, 0.18);
}
.blog-comment-reply {
  padding: .9rem .95rem;
  border-radius: var(--radius-2xl);
  background: rgba(255,255,255,.72);
  transition:
    background 240ms ease,
    box-shadow 240ms ease,
    transform 240ms ease;
}
.blog-comment-reply--highlight {
  background: rgba(247, 193, 70, 0.16);
  box-shadow: 0 14px 28px rgba(214, 142, 52, 0.1);
  transform: translateY(-1px);
}
.blog-comment-card__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  color: var(--color-text-secondary);
}
.blog-comment-card strong {
  color: var(--color-text-strong);
}
.blog-comment-card p {
  margin-top: .65rem;
  color: var(--color-text-strong);
  line-height: 1.75;
}
.blog-comment-card__actions {
  display: flex;
  gap: .9rem;
  margin-top: .7rem;
}
.blog-comment-card__reply-label {
  margin-left: .35rem;
  color: var(--color-accent-deep);
  font-weight: 600;
}
@media (max-width: 960px) {
  .blog-detail-layout {
    grid-template-columns: 1fr;
  }
  .blog-detail-cover {
    height: 18rem;
  }
}
@media (max-width: 720px) {
  .blog-comment-panel__header {
    flex-direction: column;
  }

  .blog-comment-panel__tools {
    justify-items: start;
  }

  .blog-detail-neighbors,
  .blog-detail-related__grid {
    grid-template-columns: 1fr;
  }

  .blog-detail-neighbors__item--next {
    text-align: left;
  }

  .blog-detail-page {
    width: min(100% - 20px, 1180px);
    padding: 88px 0 40px;
  }
  .blog-detail-hero,
  .blog-detail-card,
  .blog-detail-content,
  .blog-comment-panel {
    padding: var(--space-lg);
  }
}
</style>
