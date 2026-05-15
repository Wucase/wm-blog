import { appConfig } from '../config/app'
import { homePageMockData, normalizeHomePageData } from '../data/home'
import type { HomePageData } from '../types/home'
import { http } from '../utils/http'

const HOME_PAGE_SETTINGS_KEY = 'wm-blog:home-page-settings'

interface HomePageSettingsResponse {
  data: HomePageData
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getStoredHomePageSettings(): Partial<HomePageData> | null {
  if (!canUseStorage()) {
    return null
  }

  const rawValue = window.localStorage.getItem(HOME_PAGE_SETTINGS_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as Partial<HomePageData>
  } catch {
    return null
  }
}

function saveLocalHomePageSettings(data: HomePageData) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(HOME_PAGE_SETTINGS_KEY, JSON.stringify(data))
}

function clearLocalHomePageSettings() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(HOME_PAGE_SETTINGS_KEY)
}

function mapSettingsResponse(responseData: HomePageSettingsResponse | HomePageData) {
  const pageData = 'data' in responseData ? responseData.data : responseData
  return normalizeHomePageData(pageData)
}

// 公开首页在 mock 模式下允许读取本地配置；真实环境应完全以服务端返回为准。
export function mergeMockHomePageSettings(data: HomePageData) {
  if (!appConfig.useMock) {
    return data
  }

  const storedSettings = getStoredHomePageSettings()

  if (!storedSettings) {
    return data
  }

  return normalizeHomePageData({
    ...data,
    ...storedSettings,
  })
}

// 管理员配置页读取首页配置。
export async function getAdminHomePageSettings() {
  if (appConfig.useMock) {
    return mergeMockHomePageSettings(homePageMockData)
  }

  const response = await http.get<HomePageSettingsResponse | HomePageData>('/admin/home-settings')
  return mapSettingsResponse(response.data)
}

// 管理员配置页保存首页配置。
export async function saveAdminHomePageSettings(data: HomePageData) {
  if (appConfig.useMock) {
    saveLocalHomePageSettings(data)
    return normalizeHomePageData(data)
  }

  const response = await http.put<HomePageSettingsResponse | HomePageData>(
    '/admin/home-settings',
    data,
  )

  return mapSettingsResponse(response.data)
}

// 仅在 mock 模式下重置本地配置；真实环境下重新从服务端拉取。
export function resetAdminHomePageSettings() {
  if (appConfig.useMock) {
    clearLocalHomePageSettings()
  }

  return structuredClone(homePageMockData)
}
