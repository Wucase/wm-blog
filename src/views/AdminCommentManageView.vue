<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AdminManageNav from '../components/admin/AdminManageNav.vue'
import { deleteAdminComment, getAdminComments } from '../services/articleEditor'
import type { AdminCommentSummary } from '../types/adminComment'

const loading = ref(true)
const comments = ref<AdminCommentSummary[]>([])
const deletingCommentId = ref('')
const keyword = ref('')
const articleId = ref('')
const pendingDeleteComment = ref<AdminCommentSummary | null>(null)

const totalText = computed(() => `共 ${comments.value.length} 条评论`)

async function loadComments() {
  loading.value = true

  try {
    comments.value = await getAdminComments(keyword.value, articleId.value)
  } finally {
    loading.value = false
  }
}

async function handleDeleteConfirm() {
  if (!pendingDeleteComment.value) {
    return
  }

  deletingCommentId.value = pendingDeleteComment.value.id

  try {
    await deleteAdminComment(pendingDeleteComment.value.id)
    comments.value = comments.value.filter((item) => item.id !== pendingDeleteComment.value?.id)
  } finally {
    deletingCommentId.value = ''
    pendingDeleteComment.value = null
  }
}

onMounted(() => {
  loadComments()
})
</script>

<template>
  <main class="admin-comment-page">
    <section class="admin-comment-shell">
      <header class="admin-comment-hero">
        <p>Admin Comments</p>
        <h1>管理员评论管理</h1>
        <span>集中查看所有评论内容、回复关系和所属文章，并支持快速删除异常评论。</span>
      </header>

      <AdminManageNav />

      <section class="admin-comment-filter">
        <input v-model="keyword" type="text" placeholder="搜索评论内容或评论人" @keydown.enter.prevent="loadComments" />
        <input v-model="articleId" type="text" placeholder="按文章 ID 筛选" @keydown.enter.prevent="loadComments" />
        <button type="button" class="admin-comment-filter__btn" @click="loadComments">筛选</button>
        <span class="admin-comment-filter__count">{{ totalText }}</span>
      </section>

      <section class="admin-comment-card">
        <div v-if="loading" class="admin-comment-empty">评论列表加载中...</div>
        <div v-else-if="comments.length === 0" class="admin-comment-empty">当前还没有评论数据。</div>

        <div v-else class="admin-comment-list">
          <article v-for="comment in comments" :key="comment.id" class="admin-comment-item">
            <div class="admin-comment-item__head">
              <div>
                <strong>{{ comment.authorName }}</strong>
                <span v-if="comment.replyToAuthor">回复 {{ comment.replyToAuthor }}</span>
              </div>
              <small>{{ comment.createdAt }}</small>
            </div>

            <p class="admin-comment-item__content">{{ comment.content }}</p>

            <div class="admin-comment-item__meta">
              <a :href="`/wm/blog/${comment.articleId}`" target="_blank" rel="noreferrer">
                所属文章：{{ comment.articleTitle }}
              </a>
              <span>文章 ID：{{ comment.articleId }}</span>
              <span v-if="comment.authorId">用户 ID：{{ comment.authorId }}</span>
            </div>

            <div class="admin-comment-item__actions">
              <button
                type="button"
                class="admin-comment-item__action admin-comment-item__action--danger"
                :disabled="deletingCommentId === comment.id"
                @click="pendingDeleteComment = comment"
              >
                删除评论
              </button>
            </div>
          </article>
        </div>
      </section>

      <div v-if="pendingDeleteComment" class="admin-comment-mask" @click.self="pendingDeleteComment = null">
        <section class="admin-comment-dialog">
          <p>Delete Comment</p>
          <h2>确认删除这条评论？</h2>
          <span>删除后不可恢复，文章评论数也会同步减少。</span>

          <div class="admin-comment-dialog__actions">
            <button type="button" class="admin-comment-item__action" @click="pendingDeleteComment = null">取消</button>
            <button
              type="button"
              class="admin-comment-item__action admin-comment-item__action--danger"
              :disabled="deletingCommentId === pendingDeleteComment.id"
              @click="handleDeleteConfirm"
            >
              {{ deletingCommentId === pendingDeleteComment.id ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-comment-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 96px 0 80px;
}

.admin-comment-shell {
  display: grid;
  gap: var(--space-xl);
}

.admin-comment-hero,
.admin-comment-filter,
.admin-comment-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.85);
  box-shadow: var(--shadow-soft);
}

.admin-comment-hero p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.admin-comment-hero h1 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}

.admin-comment-hero span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
}

.admin-comment-filter {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(12rem, .6fr) auto auto;
  gap: .8rem;
  align-items: center;
}

.admin-comment-filter input {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  outline: none;
  padding: .82rem .95rem;
  font: inherit;
}

.admin-comment-filter__btn {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  padding: .8rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.admin-comment-filter__count {
  color: var(--color-text-secondary);
  justify-self: end;
}

.admin-comment-list {
  display: grid;
  gap: var(--space-md);
}

.admin-comment-item {
  display: grid;
  gap: .8rem;
  padding: 1rem 1.05rem;
  border-radius: var(--radius-2xl);
  background: rgba(16, 42, 67, 0.05);
}

.admin-comment-item__head,
.admin-comment-item__meta,
.admin-comment-item__actions,
.admin-comment-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: .7rem;
}

.admin-comment-item__head strong {
  color: var(--color-text-strong);
}

.admin-comment-item__head span,
.admin-comment-item__head small,
.admin-comment-item__meta span {
  color: var(--color-text-secondary);
}

.admin-comment-item__content {
  color: var(--color-text-strong);
  line-height: 1.8;
}

.admin-comment-item__meta a {
  color: var(--color-accent-deep);
}

.admin-comment-item__action {
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  padding: .55rem .85rem;
  font: inherit;
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
}

.admin-comment-item__action--danger {
  background: rgba(193, 75, 75, 0.12);
  color: #9d3131;
}

.admin-comment-empty {
  color: var(--color-text-secondary);
}

.admin-comment-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(16, 42, 67, 0.26);
  backdrop-filter: blur(12px);
}

.admin-comment-dialog {
  width: min(100%, 28rem);
  padding: 1.35rem;
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.96);
  box-shadow: var(--shadow-card);
}

.admin-comment-dialog p {
  color: #9d3131;
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.admin-comment-dialog h2 {
  margin-top: .55rem;
  color: var(--color-text-strong);
}

.admin-comment-dialog span {
  display: block;
  margin-top: .75rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
}

@media (max-width: 720px) {
  .admin-comment-page {
    width: min(100% - 20px, 1180px);
    padding: 88px 0 40px;
  }

  .admin-comment-hero,
  .admin-comment-filter,
  .admin-comment-card {
    padding: 1.2rem;
  }

  .admin-comment-filter {
    grid-template-columns: 1fr;
  }
}
</style>
