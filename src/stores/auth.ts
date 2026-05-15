import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { appConfig } from '../config/app'
import { getCurrentUser, logoutRequest } from '../services/auth'
import type { AuthUser } from '../types/auth'

const AUTH_USER_STORAGE_KEY = 'wm-blog:auth-user'

type AuthUserProfile = Omit<AuthUser, 'token'>

function toSafeProfile(user: AuthUser): AuthUserProfile {
  return {
    id: user.id,
    name: user.name,
    avatarText: user.avatarText,
    role: user.role,
  }
}

function readStoredProfile() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthUserProfile
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<AuthUserProfile | null>(readStoredProfile())
  const initialized = ref(false)
  const restoring = ref(false)

  const user = computed<AuthUser | null>(() => {
    if (!profile.value) {
      return null
    }

    return {
      ...profile.value,
      token: 'cookie-session',
    }
  })

  const isLoggedIn = computed(() => Boolean(profile.value))

  function setUser(nextUser: AuthUser) {
    profile.value = toSafeProfile(nextUser)
    initialized.value = true

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(profile.value))
    }
  }

  function clearUser() {
    profile.value = null
    initialized.value = true

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }
  }

  async function restoreSession(force = false) {
    if (restoring.value) {
      return
    }

    if (initialized.value && !force) {
      return
    }

    if (appConfig.useMock) {
      initialized.value = true
      return
    }

    restoring.value = true

    try {
      const response = await getCurrentUser()
      setUser(response.user)
    } catch {
      clearUser()
    } finally {
      restoring.value = false
      initialized.value = true
    }
  }

  async function logout() {
    if (!appConfig.useMock) {
      try {
        await logoutRequest()
      } catch {
        // 退出登录时优先清理本地状态，不阻塞用户流程。
      }
    }

    clearUser()
  }

  return {
    profile,
    initialized,
    restoring,
    user,
    isLoggedIn,
    setUser,
    clearUser,
    restoreSession,
    logout,
  }
})
