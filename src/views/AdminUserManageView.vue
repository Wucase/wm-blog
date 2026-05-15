<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AdminManageNav from '../components/admin/AdminManageNav.vue'
import { getAdminUsers, updateAdminUserRole } from '../services/auth'
import type { AdminUserSummary } from '../types/adminUser'

const loading = ref(true)
const users = ref<AdminUserSummary[]>([])
const updatingUserId = ref('')
const keyword = ref('')
const role = ref('all')

const totalText = computed(() => `共 ${users.value.length} 位用户`)

async function loadUsers() {
  loading.value = true

  try {
    users.value = await getAdminUsers(keyword.value, role.value)
  } finally {
    loading.value = false
  }
}

async function handleRoleChange(user: AdminUserSummary, nextRole: 'user' | 'admin') {
  updatingUserId.value = user.id

  try {
    const nextUser = await updateAdminUserRole(user.id, nextRole)
    users.value = users.value.map((item) => (item.id === user.id ? nextUser : item))
  } finally {
    updatingUserId.value = ''
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <main class="admin-user-page">
    <section class="admin-user-shell">
      <header class="admin-user-hero">
        <p>Admin Users</p>
        <h1>管理员用户管理</h1>
        <span>集中查看站点用户、手机号和角色，并支持把普通用户提升为管理员或恢复为普通用户。</span>
      </header>

      <AdminManageNav />

      <section class="admin-user-filter">
        <input v-model="keyword" type="text" placeholder="搜索用户名或手机号" @keydown.enter.prevent="loadUsers" />
        <select v-model="role" @change="loadUsers">
          <option value="all">全部角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
        <button type="button" class="admin-user-filter__btn" @click="loadUsers">筛选</button>
        <span class="admin-user-filter__count">{{ totalText }}</span>
      </section>

      <section class="admin-user-card">
        <div v-if="loading" class="admin-user-empty">用户列表加载中...</div>
        <div v-else-if="users.length === 0" class="admin-user-empty">当前还没有用户数据。</div>

        <div v-else class="admin-user-list">
          <article v-for="user in users" :key="user.id" class="admin-user-item">
            <div class="admin-user-item__main">
              <span class="admin-user-item__avatar">{{ user.avatarText }}</span>
              <div>
                <div class="admin-user-item__head">
                  <strong>{{ user.name }}</strong>
                  <span :data-role="user.role">{{ user.role }}</span>
                </div>
                <p>{{ user.phone }}</p>
                <small>注册时间：{{ user.createdAt }}</small>
              </div>
            </div>

            <div class="admin-user-item__actions">
              <button
                type="button"
                class="admin-user-item__action"
                :disabled="updatingUserId === user.id || user.role === 'user'"
                @click="handleRoleChange(user, 'user')"
              >
                设为普通用户
              </button>
              <button
                type="button"
                class="admin-user-item__action admin-user-item__action--solid"
                :disabled="updatingUserId === user.id || user.role === 'admin'"
                @click="handleRoleChange(user, 'admin')"
              >
                设为管理员
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.admin-user-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 96px 0 80px;
}

.admin-user-shell {
  display: grid;
  gap: var(--space-xl);
}

.admin-user-hero,
.admin-user-filter,
.admin-user-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.85);
  box-shadow: var(--shadow-soft);
}

.admin-user-hero p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.admin-user-hero h1 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}

.admin-user-hero span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
}

.admin-user-filter {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(10rem, .6fr) auto auto;
  gap: .8rem;
  align-items: center;
}

.admin-user-filter input,
.admin-user-filter select {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  outline: none;
  padding: .82rem .95rem;
  font: inherit;
}

.admin-user-filter__btn {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
  padding: .8rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.admin-user-filter__count {
  color: var(--color-text-secondary);
  justify-self: end;
}

.admin-user-list {
  display: grid;
  gap: var(--space-md);
}

.admin-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 1rem 1.05rem;
  border-radius: var(--radius-2xl);
  background: rgba(16, 42, 67, 0.05);
}

.admin-user-item__main {
  display: flex;
  align-items: center;
  gap: .9rem;
}

.admin-user-item__avatar {
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: linear-gradient(145deg, rgba(247, 193, 70, 0.92), rgba(214, 142, 52, 1));
  color: #fff;
  font-weight: 800;
}

.admin-user-item__head {
  display: flex;
  align-items: center;
  gap: .65rem;
}

.admin-user-item__head strong {
  color: var(--color-text-strong);
}

.admin-user-item__head span {
  padding: .35rem .65rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  font-size: .76rem;
  font-weight: 700;
}

.admin-user-item__head span[data-role='admin'] {
  background: rgba(214, 142, 52, 0.14);
  color: var(--color-accent-deep);
}

.admin-user-item p,
.admin-user-item small,
.admin-user-empty {
  color: var(--color-text-secondary);
}

.admin-user-item__actions {
  display: flex;
  gap: .55rem;
  flex-wrap: wrap;
}

.admin-user-item__action {
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

.admin-user-item__action--solid {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
}

.admin-user-item__action:disabled {
  opacity: .68;
  cursor: wait;
}

@media (max-width: 720px) {
  .admin-user-page {
    width: min(100% - 20px, 1180px);
    padding: 88px 0 40px;
  }

  .admin-user-hero,
  .admin-user-filter,
  .admin-user-card {
    padding: 1.2rem;
  }

  .admin-user-filter {
    grid-template-columns: 1fr;
  }

  .admin-user-item {
    display: grid;
  }
}
</style>
