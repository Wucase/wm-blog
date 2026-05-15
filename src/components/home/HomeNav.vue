<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { HomeNavUser, HomePageData } from '../../types/home'

const props = withDefaults(defineProps<{
  nav: HomePageData['nav']
  mode?: 'fixed' | 'preview'
  showSearch?: boolean
  searchPlaceholder?: string
  currentUser?: HomeNavUser | null
  searchValue?: string
}>(), {
  mode: 'fixed',
  showSearch: false,
  searchPlaceholder: '搜索公开文章',
  currentUser: null,
  searchValue: '',
})

const emit = defineEmits<{
  'update:searchValue': [value: string]
  logout: []
}>()

const isVisible = ref(true)
const isElevated = ref(false)
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

let lastScrollTop = 0

// 根据滚动方向控制导航显示状态：下滑隐藏，上滑吸顶出现。
function handleScroll() {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollDelta = currentScrollTop - lastScrollTop

  isElevated.value = currentScrollTop > 24

  // 小幅滚动不触发状态切换，避免导航抖动。
  if (Math.abs(scrollDelta) < 8) {
    return
  }

  if (currentScrollTop <= 8 || scrollDelta < 0) {
    isVisible.value = true
  } else if (scrollDelta > 0 && currentScrollTop > 88) {
    isVisible.value = false
  }

  lastScrollTop = Math.max(currentScrollTop, 0)
}

onMounted(() => {
  if (props.mode !== 'fixed') {
    isElevated.value = true
  } else {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  if (props.mode === 'fixed') {
    window.removeEventListener('scroll', handleScroll)
  }

  document.removeEventListener('click', handleDocumentClick)
})

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

function handleUserMenuItemClick(action?: 'navigate' | 'logout') {
  if (action === 'logout') {
    emit('logout')
  }

  closeUserMenu()
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null

  if (!userMenuRef.value || !target) {
    return
  }

  if (!userMenuRef.value.contains(target)) {
    closeUserMenu()
  }
}
</script>

<template>
  <header
    class="home-nav"
    :class="{
      'home-nav--hidden': !isVisible,
      'home-nav--elevated': isElevated,
      'home-nav--preview': mode === 'preview',
    }"
  >
    <div class="home-nav__inner">
      <a class="home-nav__brand" :href="nav.brand.href">
        <span class="home-nav__logo">{{ nav.brand.logoText }}</span>

        <span class="home-nav__brand-copy">
          <strong>{{ nav.brand.name }}</strong>
          <small>{{ nav.brand.subTitle }}</small>
        </span>
      </a>

      <nav class="home-nav__actions">
        <label v-if="showSearch" class="home-nav__search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>

          <input
            type="text"
            :value="searchValue"
            :placeholder="searchPlaceholder"
            @input="emit('update:searchValue', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <template v-if="currentUser">
          <a :href="currentUser.createHref" class="home-nav__action home-nav__action--solid">
            <svg
              class="home-nav__action-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 17.5V20H6.5L16.4 10.1L13.9 7.6L4 17.5Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <path
                d="M12.9 8.6L15.4 6.1C16.1 5.4 17.2 5.4 17.9 6.1L17.9 6.1C18.6 6.8 18.6 7.9 17.9 8.6L15.4 11.1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            创作
          </a>

          <div ref="userMenuRef" class="home-nav__user">
            <button
              type="button"
              class="home-nav__user-trigger"
              :aria-expanded="isUserMenuOpen"
              @click.stop="toggleUserMenu"
            >
              <span class="home-nav__avatar">{{ currentUser.avatarText }}</span>
            </button>

            <div v-if="isUserMenuOpen" class="home-nav__user-menu">
              <div class="home-nav__user-summary">
                <span class="home-nav__user-summary-avatar">{{ currentUser.avatarText }}</span>
                <div>
                  <p class="home-nav__user-name">{{ currentUser.name }}</p>
                  <small class="home-nav__user-subtitle">已登录用户</small>
                </div>
              </div>

              <div class="home-nav__user-divider"></div>

              <a
                v-for="item in currentUser.menu"
                :key="item.label"
                :href="item.href"
                class="home-nav__user-link"
                @click="handleUserMenuItemClick(item.action)"
              >
                <span class="home-nav__user-link-main">
                  <span class="home-nav__user-icon" aria-hidden="true">
                    <svg
                      v-if="item.label === '个人中心'"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                      />
                      <path
                        d="M4 20C5.8 16.8 8.4 15.2 12 15.2C15.6 15.2 18.2 16.8 20 20"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 7V5.5C10 4.67 10.67 4 11.5 4H18.5C19.33 4 20 4.67 20 5.5V18.5C20 19.33 19.33 20 18.5 20H11.5C10.67 20 10 19.33 10 18.5V17"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13 12H4"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M7 9L4 12L7 15"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ item.label }}</span>
                </span>
                <span class="home-nav__user-arrow">›</span>
              </a>
            </div>
          </div>
        </template>

        <template v-else>
          <a
            v-for="action in nav.actions"
            :key="action.label"
            :href="action.href"
            class="home-nav__action"
            :class="`home-nav__action--${action.variant}`"
          >
            {{ action.label }}
          </a>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.home-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  padding: 1rem 0 0;
  transition:
    transform 280ms ease,
    opacity 280ms ease,
    padding 280ms ease;
}

.home-nav--preview {
  position: absolute;
  left: 0;
  top: 0;
  padding-top: 0.45rem;
}

.home-nav--preview.home-nav--hidden {
  opacity: 1;
  transform: none;
}

.home-nav--hidden {
  opacity: 0;
  transform: translateY(-140%);
}

.home-nav--elevated {
  padding-top: 0.65rem;
}

.home-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 0.56rem 0.88rem;
  border: 1px solid rgba(245, 241, 232, 0.08);
  border-radius: var(--radius-full);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(8, 16, 28, 0.72);
  backdrop-filter: blur(18px) saturate(125%);
  box-shadow: var(--shadow-soft);
}

.home-nav--preview .home-nav__inner {
  width: min(100% - 32px, 1180px);
}

.home-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.home-nav__logo {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(240, 179, 91, 0.26);
  border-radius: 0.9rem;
  background:
    linear-gradient(145deg, rgba(240, 179, 91, 0.2), rgba(115, 216, 231, 0.08)),
    rgba(255, 255, 255, 0.02);
  color: var(--color-text-strong);
  font-weight: 800;
  letter-spacing: 0.14em;
}

.home-nav__brand-copy {
  display: grid;
  min-width: 0;
}

.home-nav__brand-copy strong {
  color: var(--color-text-strong);
  font-family: var(--font-family-display);
  font-size: 1.08rem;
  letter-spacing: 0.02em;
}

.home-nav__brand-copy small {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.home-nav__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.home-nav__search {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 15rem;
  padding: 0.48rem 0.9rem;
  border: 1px solid rgba(245, 241, 232, 0.08);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-secondary);
}

.home-nav__search svg {
  width: 0.92rem;
  height: 0.92rem;
  flex: 0 0 auto;
}

.home-nav__search input {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-text-strong);
  font: inherit;
  font-size: 0.86rem;
  outline: none;
}

.home-nav__search input::placeholder {
  color: var(--color-text-muted);
}

.home-nav__user {
  position: relative;
}

.home-nav__user-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.home-nav__avatar {
  display: inline-grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(240, 179, 91, 0.94), rgba(214, 139, 42, 1));
  color: var(--color-primary-deep);
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.home-nav__user-menu {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  min-width: 13rem;
  padding: 0.78rem;
  border: 1px solid rgba(245, 241, 232, 0.08);
  border-radius: 1.15rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(8, 16, 28, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow-soft);
}

.home-nav__user-summary {
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.15rem 0.15rem 0.4rem;
}

.home-nav__user-summary-avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(240, 179, 91, 0.94), rgba(214, 139, 42, 1));
  color: var(--color-primary-deep);
  font-size: 0.8rem;
  font-weight: 800;
}

.home-nav__user-divider {
  height: 1px;
  margin: 0.35rem 0 0.45rem;
  background: linear-gradient(90deg, transparent, rgba(245, 241, 232, 0.12), transparent);
}

.home-nav__user-name {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 0.88rem;
  font-weight: 700;
}

.home-nav__user-subtitle {
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

.home-nav__user-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.72rem 0.82rem;
  border-radius: 0.9rem;
  color: var(--color-text-secondary);
  font-size: 0.84rem;
  transition:
    background-color var(--motion-base) ease,
    transform var(--motion-base) ease,
    color var(--motion-base) ease;
}

.home-nav__user-link-main {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.home-nav__action-icon {
  width: 0.92rem;
  height: 0.92rem;
  flex: 0 0 auto;
}

.home-nav__user-icon {
  display: inline-grid;
  place-items: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
}

.home-nav__user-icon svg {
  width: 0.82rem;
  height: 0.82rem;
}

.home-nav__user-arrow {
  color: var(--color-accent);
  font-size: 0.95rem;
}

.home-nav__user-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-strong);
  transform: translateX(2px);
}

.home-nav__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.2rem;
  padding: 0.42rem 0.84rem;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 700;
  transition:
    transform var(--motion-base) ease,
    background-color var(--motion-base) ease,
    border-color var(--motion-base) ease;
}

.home-nav__action:hover {
  transform: translateY(-2px);
}

.home-nav__action--ghost {
  color: var(--color-text-strong);
  border-color: rgba(245, 241, 232, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.home-nav__action--solid {
  border-color: rgba(240, 179, 91, 0.16);
  background: linear-gradient(145deg, rgba(240, 179, 91, 0.96), rgba(214, 139, 42, 0.98));
  color: var(--color-primary-deep);
  box-shadow: 0 12px 24px rgba(214, 139, 42, 0.2);
}

@media (max-width: 960px) {
  .home-nav__inner {
    width: min(100% - 24px, 1180px);
  }
}

@media (max-width: 720px) {
  .home-nav {
    padding-top: 0.65rem;
  }

  .home-nav__inner {
    width: min(100% - 20px, 1180px);
    padding: 0.4rem 0.62rem;
  }

  .home-nav__brand-copy small {
    display: none;
  }

  .home-nav__actions {
    gap: 0.5rem;
  }

  .home-nav__search {
    min-width: 11rem;
    padding: 0.34rem 0.68rem;
  }

  .home-nav__action {
    min-width: 3.7rem;
    padding: 0.28rem 0.62rem;
    font-size: 0.8rem;
  }

  .home-nav__avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.76rem;
  }
}

@media (max-width: 560px) {
  .home-nav__search {
    min-width: 0;
    width: 100%;
    order: 3;
  }

  .home-nav__actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .home-nav__brand-copy strong {
    font-size: 0.92rem;
  }

  .home-nav__logo {
    width: 2.02rem;
    height: 2.02rem;
    font-size: 0.8rem;
  }

  .home-nav__action {
    min-width: 4.2rem;
    padding-inline: 0.8rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .home-nav__action:hover {
    transform: none;
  }
}
</style>
