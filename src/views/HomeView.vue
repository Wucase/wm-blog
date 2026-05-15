<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import HomeAbout from '../components/home/HomeAbout.vue'
import HomeFeatured from '../components/home/HomeFeatured.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import HomeHero from '../components/home/HomeHero.vue'
import HomeHighlights from '../components/home/HomeHighlights.vue'
import HomeNav from '../components/home/HomeNav.vue'
import { homePageMockData } from '../data/home'
import { getHomePageData } from '../services/home'

// 页面层只关心数据加载状态，不关心具体来自 mock 还是后端。
const pageData = ref(homePageMockData)
const loading = ref(true)
const parallaxOffset = ref(0)

const aboutData = computed(() => pageData.value.about)
const pageParallaxStyle = computed(() => ({
  '--page-parallax-soft': `${parallaxOffset.value * 0.18}px`,
  '--page-parallax-strong': `${parallaxOffset.value * 0.32}px`,
}))

async function loadPageData() {
  try {
    pageData.value = await getHomePageData()
  } finally {
    loading.value = false
  }
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
  parallaxOffset.value = Math.min(currentScrollTop, 720)
}
</script>

<template>
  <main class="home-page" :style="pageParallaxStyle">
    <HomeNav :nav="pageData.nav" />

    <div v-if="loading" class="loading-panel">首页内容加载中...</div>

    <template v-else>
      <div class="home-page__glow home-page__glow--left" aria-hidden="true"></div>
      <div class="home-page__glow home-page__glow--right" aria-hidden="true"></div>
      <HomeHero :hero="pageData.hero" />
      <HomeHighlights
        :metrics="pageData.highlightMetrics"
        :sections="pageData.entrySections"
      />
      <HomeFeatured :posts="pageData.featuredPosts" />
      <HomeAbout :about="aboutData" />
      <HomeFooter :footer="pageData.footer" />
    </template>
  </main>
</template>

<style scoped>
.home-page {
  position: relative;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.home-page__glow {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(16px);
  pointer-events: none;
  opacity: 0.85;
  animation: driftGlow 14s ease-in-out infinite;
}

.home-page__glow--left {
  --glow-parallax: var(--page-parallax-soft, 0px);
  top: 8rem;
  left: -5rem;
  width: 15rem;
  height: 15rem;
  background: radial-gradient(circle, rgba(115, 216, 231, 0.18), transparent 70%);
}

.home-page__glow--right {
  --glow-parallax: var(--page-parallax-strong, 0px);
  top: 28rem;
  right: -4rem;
  width: 18rem;
  height: 18rem;
  background: radial-gradient(circle, rgba(240, 179, 91, 0.16), transparent 70%);
  animation-delay: -6s;
}

.home-page > :deep(*) {
  position: relative;
  z-index: 1;
}

.loading-panel {
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
    opacity: 0.7;
  }

  50% {
    transform: translate3d(0.8rem, calc((var(--glow-parallax, 0px) * -1) - 1.2rem), 0) scale(1.08);
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .home-page {
    width: min(100% - 24px, 1180px);
    padding-top: 100px;
    padding-bottom: 56px;
  }
}

@media (max-width: 720px) {
  .home-page {
    width: min(100% - 20px, 1180px);
    padding-top: 88px;
    padding-bottom: 40px;
  }

  .home-page__glow {
    display: none;
  }
}
</style>
