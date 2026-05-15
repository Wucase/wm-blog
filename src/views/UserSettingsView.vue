<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HomeNav from '../components/home/HomeNav.vue'
import { homeNav } from '../data/home'
import { getUserProfileSettings, updateUserPassword, updateUserProfileSettings } from '../services/auth'
import { useAuthStore } from '../stores/auth'
import type { HomeNavUser } from '../types/home'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(true)
const saving = ref(false)
const profileMessage = ref('')
const passwordSaving = ref(false)
const passwordMessage = ref('')
const form = reactive({
  name: '',
  phone: '',
  avatarText: '',
  role: 'user',
})
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

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

async function loadProfile() {
  loading.value = true

  try {
    const profile = await getUserProfileSettings()
    form.name = profile.name
    form.phone = profile.phone
    form.avatarText = profile.avatarText
    form.role = profile.role
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    profileMessage.value = '用户名不能为空。'
    return
  }

  saving.value = true
  profileMessage.value = ''

  try {
    const profile = await updateUserProfileSettings({
      name: form.name,
      avatarText: form.avatarText,
    })

    authStore.setUser({
      id: profile.id,
      name: profile.name,
      avatarText: profile.avatarText,
      role: profile.role,
      token: 'cookie-session',
    })
    profileMessage.value = '资料已更新。'
  } finally {
    saving.value = false
  }
}

async function handlePasswordSave() {
  passwordMessage.value = ''

  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    passwordMessage.value = '请填写完整的密码信息。'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordMessage.value = '两次输入的新密码不一致。'
    return
  }

  passwordSaving.value = true

  try {
    await updateUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordMessage.value = '密码已更新，下次登录请使用新密码。'
  } catch (error) {
    const nextMessage =
      typeof error === 'object' && error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
        : ''

    passwordMessage.value = nextMessage || '密码更新失败，请稍后重试。'
  } finally {
    passwordSaving.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push(`/wm/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <main class="user-settings-page">
    <HomeNav :nav="homeNav" :current-user="currentUser" @logout="handleLogout" />

    <section class="user-settings-shell">
      <header class="user-settings-hero">
        <p>User Settings</p>
        <h1>用户资料设置</h1>
        <span>当前支持修改基础资料和登录密码，手机号暂时保持只读。</span>
      </header>

      <section class="user-settings-card">
        <div v-if="loading" class="user-settings-empty">资料加载中...</div>

        <form v-else class="user-settings-form" @submit.prevent="handleSave">
          <label class="user-settings-field">
            <span>用户名</span>
            <input v-model="form.name" type="text" placeholder="请输入用户名" />
          </label>

          <label class="user-settings-field">
            <span>手机号</span>
            <input v-model="form.phone" type="text" disabled />
          </label>

          <label class="user-settings-field">
            <span>头像文字</span>
            <input v-model="form.avatarText" type="text" maxlength="4" placeholder="例如：WM" />
          </label>

          <label class="user-settings-field">
            <span>当前角色</span>
            <input v-model="form.role" type="text" disabled />
          </label>

          <div class="user-settings-actions">
            <button type="button" class="user-settings-btn" @click="router.push('/wm/user/profile')">返回个人中心</button>
            <button type="submit" class="user-settings-btn user-settings-btn--solid" :disabled="saving">
              {{ saving ? '保存中...' : '保存资料' }}
            </button>
          </div>

          <p v-if="profileMessage" class="user-settings-message">{{ profileMessage }}</p>
        </form>
      </section>

      <section class="user-settings-card">
        <form class="user-settings-form" @submit.prevent="handlePasswordSave">
          <label class="user-settings-field">
            <span>当前密码</span>
            <input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" />
          </label>

          <label class="user-settings-field">
            <span>新密码</span>
            <input v-model="passwordForm.newPassword" type="password" placeholder="请输入至少 6 位新密码" />
          </label>

          <label class="user-settings-field">
            <span>确认新密码</span>
            <input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
          </label>

          <div class="user-settings-actions">
            <button type="submit" class="user-settings-btn user-settings-btn--solid" :disabled="passwordSaving">
              {{ passwordSaving ? '更新中...' : '更新密码' }}
            </button>
          </div>

          <p v-if="passwordMessage" class="user-settings-message">{{ passwordMessage }}</p>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.user-settings-page {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
  padding: 108px 0 80px;
}

.user-settings-shell {
  display: grid;
  gap: var(--space-xl);
}

.user-settings-hero,
.user-settings-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 253, 248, 0.85);
  box-shadow: var(--shadow-soft);
}

.user-settings-hero p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.user-settings-hero h1 {
  margin-top: var(--space-xs);
  color: var(--color-text-strong);
}

.user-settings-hero span,
.user-settings-empty,
.user-settings-message {
  color: var(--color-text-secondary);
}

.user-settings-hero span {
  display: block;
  margin-top: var(--space-sm);
}

.user-settings-form {
  display: grid;
  gap: 1rem;
}

.user-settings-field {
  display: grid;
  gap: .5rem;
}

.user-settings-field span {
  color: var(--color-primary);
  font-size: .9rem;
  font-weight: 700;
}

.user-settings-field input {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  outline: none;
  padding: .82rem .95rem;
  font: inherit;
}

.user-settings-field input:disabled {
  opacity: .7;
  cursor: not-allowed;
}

.user-settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  margin-top: .5rem;
}

.user-settings-btn {
  border: 0;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.08);
  color: var(--color-primary);
  padding: .8rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.user-settings-btn--solid {
  background: linear-gradient(145deg, var(--color-accent), var(--color-accent-deep));
  color: #fff;
}

@media (max-width: 720px) {
  .user-settings-page {
    width: min(100% - 20px, 980px);
    padding: 88px 0 40px;
  }

  .user-settings-hero,
  .user-settings-card {
    padding: 1.2rem;
  }

  .user-settings-actions {
    display: grid;
  }
}
</style>
