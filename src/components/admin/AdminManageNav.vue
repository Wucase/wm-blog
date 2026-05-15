<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 管理后台统一导航，避免管理页互相割裂。
const route = useRoute()

const navItems = [
  {
    label: '仪表盘',
    description: '查看站点概览',
    to: '/wm/admin/dashboard',
    match: (path: string) => path === '/wm/admin/dashboard',
  },
  {
    label: '首页配置',
    description: '管理首页内容',
    to: '/wm/admin/home-view-setting',
    match: (path: string) => path.startsWith('/wm/admin/home-view-setting'),
  },
  {
    label: '文章管理',
    description: '审核与维护文章',
    to: '/wm/admin/articles',
    match: (path: string) => path.startsWith('/wm/admin/articles'),
  },
  {
    label: '评论管理',
    description: '处理评论内容',
    to: '/wm/admin/comments',
    match: (path: string) => path.startsWith('/wm/admin/comments'),
  },
  {
    label: '用户管理',
    description: '调整用户角色',
    to: '/wm/admin/users',
    match: (path: string) => path.startsWith('/wm/admin/users'),
  },
]

const activePath = computed(() => route.path)
</script>

<template>
  <nav class="admin-manage-nav" aria-label="管理员导航">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="admin-manage-nav__item"
      :data-active="item.match(activePath)"
    >
      <strong>{{ item.label }}</strong>
      <span>{{ item.description }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.admin-manage-nav {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;
}

.admin-manage-nav__item {
  display: grid;
  gap: 0.3rem;
  padding: 1rem 1.05rem;
  border: 1px solid rgba(16, 42, 67, 0.08);
  border-radius: var(--radius-2xl);
  background: rgba(255, 253, 248, 0.78);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow-soft);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.admin-manage-nav__item strong {
  color: var(--color-text-strong);
  font-size: 0.96rem;
}

.admin-manage-nav__item span {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}

.admin-manage-nav__item:hover {
  transform: translateY(-2px);
  border-color: rgba(214, 142, 52, 0.2);
}

.admin-manage-nav__item[data-active='true'] {
  background: linear-gradient(145deg, rgba(247, 193, 70, 0.16), rgba(255, 253, 248, 0.98));
  border-color: rgba(214, 142, 52, 0.3);
  box-shadow: 0 18px 38px rgba(16, 42, 67, 0.1);
}

.admin-manage-nav__item[data-active='true'] strong {
  color: var(--color-accent-deep);
}

@media (max-width: 1080px) {
  .admin-manage-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .admin-manage-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-manage-nav__item {
    padding: 0.9rem;
  }
}

@media (max-width: 560px) {
  .admin-manage-nav {
    grid-template-columns: 1fr;
  }
}
</style>
