<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AdminManageNav from '../components/admin/AdminManageNav.vue'
import { getAdminDashboardStats } from '../services/auth'
import type { AdminDashboardStats } from '../types/adminDashboard'

const loading = ref(true)
const stats = ref<AdminDashboardStats | null>(null)

const summaryCards = computed(() => {
  if (!stats.value) {
    return []
  }

  return [
    { label: '总用户数', value: stats.value.totalUsers },
    { label: '管理员数', value: stats.value.adminUsers },
    { label: '文章总数', value: stats.value.totalArticles },
    { label: '评论总数', value: stats.value.totalComments },
    { label: '累计收藏', value: stats.value.totalCollects },
    { label: '累计点赞', value: stats.value.totalLikes },
  ]
})

async function loadDashboard() {
  loading.value = true

  try {
    stats.value = await getAdminDashboardStats()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <main class="admin-dashboard-page">
    <section class="admin-dashboard-shell">
      <header class="admin-dashboard-hero">
        <p>Admin Dashboard</p>
        <h1>管理员仪表盘</h1>
        <span>快速查看当前站点的用户、文章、评论和互动总览。</span>
      </header>

      <AdminManageNav />

      <section v-if="loading" class="admin-dashboard-card">仪表盘数据加载中...</section>

      <template v-else-if="stats">
        <section class="admin-dashboard-grid">
          <article v-for="card in summaryCards" :key="card.label" class="admin-dashboard-card">
            <p>{{ card.label }}</p>
            <strong>{{ card.value }}</strong>
          </article>
        </section>

        <section class="admin-dashboard-status">
          <article class="admin-dashboard-card">
            <p>文章状态</p>
            <h2>内容分布</h2>
            <ul>
              <li>公开文章：{{ stats.publicArticles }}</li>
              <li>草稿文章：{{ stats.draftArticles }}</li>
              <li>私密文章：{{ stats.privateArticles }}</li>
            </ul>
          </article>

          <article class="admin-dashboard-card">
            <p>互动概览</p>
            <h2>站点热度</h2>
            <ul>
              <li>累计分享：{{ stats.totalShares }}</li>
              <li>累计点赞：{{ stats.totalLikes }}</li>
              <li>累计收藏：{{ stats.totalCollects }}</li>
            </ul>
          </article>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped>
.admin-dashboard-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 96px 0 80px;
}

.admin-dashboard-shell,
.admin-dashboard-grid,
.admin-dashboard-status {
  display: grid;
  gap: var(--space-xl);
}

.admin-dashboard-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.admin-dashboard-status {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-dashboard-hero,
.admin-dashboard-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.85);
  box-shadow: var(--shadow-soft);
}

.admin-dashboard-hero p,
.admin-dashboard-card p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.admin-dashboard-hero h1,
.admin-dashboard-card h2 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}

.admin-dashboard-hero span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
}

.admin-dashboard-card strong {
  display: block;
  margin-top: .6rem;
  color: var(--color-text-strong);
  font-size: clamp(2rem, 4vw, 3rem);
}

.admin-dashboard-card ul {
  margin: var(--space-md) 0 0;
  padding-left: 1.1rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: .55rem;
}

@media (max-width: 720px) {
  .admin-dashboard-page {
    width: min(100% - 20px, 1180px);
    padding: 88px 0 40px;
  }

  .admin-dashboard-grid,
  .admin-dashboard-status {
    grid-template-columns: 1fr;
  }

  .admin-dashboard-hero,
  .admin-dashboard-card {
    padding: 1.2rem;
  }
}
</style>
