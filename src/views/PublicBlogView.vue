<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BlogArticleStream from '../components/blog/BlogArticleStream.vue'
import BlogFeaturedShelf from '../components/blog/BlogFeaturedShelf.vue'
import BlogPublicHero from '../components/blog/BlogPublicHero.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import HomeNav from '../components/home/HomeNav.vue'
import { publicBlogPageMockData } from '../data/blog'
import { homeFooter, homeNav } from '../data/home'
import { getPublicBlogArticlesPage, getPublicBlogPageData } from '../services/blog'
import { useAuthStore } from '../stores/auth'
import type { HomeNavUser } from '../types/home'

const router = useRouter()
const authStore = useAuthStore()

// 页面层只关心公开博客页的数据加载，不关心具体来自 mock 还是后端。
const pageData = ref(publicBlogPageMockData)
const loading = ref(true)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 10
const hasMore = ref(false)
const searchValue = ref('')
const activeCategory = ref('')
const parallaxOffset = ref(0)

let searchDebounceTimer: number | null = null

const currentUser = computed<HomeNavUser | null>(() => {
  if (!authStore.user) {
    return null
  }

  const baseMenu: HomeNavUser['menu'] = [
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
  ]

  return {
    name: authStore.user.name,
    avatarText: authStore.user.avatarText,
    createHref: '/wm/user/create',
    menu: baseMenu,
  }
})

const pageParallaxStyle = computed(() => ({
  '--page-parallax-soft': `${parallaxOffset.value * 0.2}px`,
  '--page-parallax-strong': `${parallaxOffset.value * 0.34}px`,
}))

async function loadPageData() {
  try {
    pageData.value = await getPublicBlogPageData()
    const firstPage = await getPublicBlogArticlesPage(
      1,
      pageSize,
      searchValue.value,
      activeCategory.value,
    )
    pageData.value = {
      ...pageData.value,
      articles: firstPage.list,
    }
    currentPage.value = firstPage.page
    hasMore.value = firstPage.hasMore
  } finally {
    loading.value = false
  }
}

async function handleLoadMore() {
  if (loadingMore.value || !hasMore.value) {
    return
  }

  loadingMore.value = true

  try {
    const nextPage = currentPage.value + 1
    const pageResult = await getPublicBlogArticlesPage(
      nextPage,
      pageSize,
      searchValue.value,
      activeCategory.value,
    )

    pageData.value = {
      ...pageData.value,
      articles: [...pageData.value.articles, ...pageResult.list],
    }
    currentPage.value = pageResult.page
    hasMore.value = pageResult.hasMore
  } finally {
    loadingMore.value = false
  }
}

async function reloadArticles() {
  loading.value = true

  try {
    const pageResult = await getPublicBlogArticlesPage(
      1,
      pageSize,
      searchValue.value,
      activeCategory.value,
    )

    pageData.value = {
      ...pageData.value,
      articles: pageResult.list,
    }
    currentPage.value = pageResult.page
    hasMore.value = pageResult.hasMore
  } finally {
    loading.value = false
  }
}

function handleSearchChange(value: string) {
  searchValue.value = value

  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = window.setTimeout(() => {
    reloadArticles()
  }, 260)
}

function handleCategorySelect(category: string) {
  activeCategory.value = category
  reloadArticles()
}

async function handleLogout() {
  await authStore.logout()
  await router.push('/wm/blog')
}

onMounted(() => {
  loadPageData()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  parallaxOffset.value = Math.min(currentScrollTop, 760)
}
</script>

<template>
  <main class="public-blog-page" :style="pageParallaxStyle">
    <HomeNav
      :nav="homeNav"
      :current-user="currentUser"
      :search-value="searchValue"
      show-search
      search-placeholder="搜索公开博客文章"
      @logout="handleLogout"
      @update:search-value="handleSearchChange"
    />

    <div v-if="loading" class="public-blog-page__loading">公开博客内容加载中...</div>

    <template v-else>
      <div class="public-blog-page__glow public-blog-page__glow--left" aria-hidden="true"></div>
      <div class="public-blog-page__glow public-blog-page__glow--right" aria-hidden="true"></div>
      <BlogPublicHero
        :data="{
          eyebrow: pageData.eyebrow,
          title: pageData.title,
          description: pageData.description,
          categories: pageData.categories,
        }"
        :active-category="activeCategory || '全部文章'"
        @select-category="handleCategorySelect"
      />
      <BlogFeaturedShelf :featured="pageData.featured" />
      <BlogArticleStream
        :articles="pageData.articles"
        :has-more="hasMore"
        :is-filtered="Boolean(searchValue.trim() || activeCategory)"
        :loading-more="loadingMore"
        @load-more="handleLoadMore"
      />
      <HomeFooter :footer="homeFooter" />
    </template>
  </main>
</template>

<style scoped>
.public-blog-page {
  position: relative;
  display: grid;
  gap: var(--space-xl);
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.public-blog-page__glow {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(18px);
  pointer-events: none;
  opacity: 0.82;
  animation: driftGlow 16s ease-in-out infinite;
}

.public-blog-page__glow--left {
  --glow-parallax: var(--page-parallax-soft, 0px);
  top: 14rem;
  left: -6rem;
  width: 16rem;
  height: 16rem;
  background: radial-gradient(circle, rgba(115, 216, 231, 0.14), transparent 72%);
}

.public-blog-page__glow--right {
  --glow-parallax: var(--page-parallax-strong, 0px);
  top: 32rem;
  right: -7rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, rgba(240, 179, 91, 0.12), transparent 72%);
  animation-delay: -7s;
}

.public-blog-page > :deep(*) {
  position: relative;
  z-index: 1;
}

.public-blog-page__loading {
  display: grid;
  place-items: center;
  min-height: 50vh;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

@keyframes driftGlow {
  0%,
  100% {
    transform: translate3d(0, calc(var(--glow-parallax, 0px) * -1), 0) scale(1);
    opacity: 0.66;
  }

  50% {
    transform: translate3d(-0.9rem, calc((var(--glow-parallax, 0px) * -1) - 1.3rem), 0) scale(1.08);
    opacity: 0.96;
  }
}

@media (max-width: 960px) {
  .public-blog-page {
    width: min(100% - 24px, 1180px);
    padding-top: 100px;
    padding-bottom: 56px;
  }
}

@media (max-width: 720px) {
  .public-blog-page {
    width: min(100% - 20px, 1180px);
    padding-top: 88px;
    padding-bottom: 40px;
  }

  .public-blog-page__glow {
    display: none;
  }
}
</style>
