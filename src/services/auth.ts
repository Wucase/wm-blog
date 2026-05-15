import { appConfig } from '../config/app'
import {
  loginWithAccountMock,
  loginWithPhoneMock,
  registerWithAccountMock,
} from '../data/auth'
import type {
  AccountLoginPayload,
  AccountRegisterPayload,
  AuthResponse,
  PhoneLoginPayload,
  UpdateUserPasswordPayload,
  UpdateUserProfilePayload,
  UserProfileSettings,
} from '../types/auth'
import type { AdminUserSummary } from '../types/adminUser'
import type { AdminDashboardStats } from '../types/adminDashboard'
import { http } from '../utils/http'

interface AuthApiResponse {
  data: AuthResponse
}

function mapAuthResponse(responseData: AuthApiResponse | AuthResponse) {
  return 'data' in responseData ? responseData.data : responseData
}

export async function loginWithAccount(payload: AccountLoginPayload) {
  if (appConfig.useMock) {
    return loginWithAccountMock(payload)
  }

  const response = await http.post<AuthApiResponse | AuthResponse>('/auth/login/account', payload)
  return mapAuthResponse(response.data)
}

export async function loginWithPhone(payload: PhoneLoginPayload) {
  if (appConfig.useMock) {
    return loginWithPhoneMock(payload)
  }

  const response = await http.post<AuthApiResponse | AuthResponse>('/auth/login/phone', payload)
  return mapAuthResponse(response.data)
}

export function getWechatLoginEntryURL() {
  return `${appConfig.apiBaseURL}/auth/login/wechat`
}

export function loginWithWechat() {
  if (typeof window === 'undefined') {
    return
  }

  window.location.href = getWechatLoginEntryURL()
}

export async function registerWithAccount(payload: AccountRegisterPayload) {
  if (appConfig.useMock) {
    return registerWithAccountMock(payload)
  }

  const response = await http.post<AuthApiResponse | AuthResponse>('/auth/register/account', payload)
  return mapAuthResponse(response.data)
}

export async function getCurrentUser() {
  const response = await http.get<AuthApiResponse | AuthResponse>('/auth/me')
  return mapAuthResponse(response.data)
}

export async function logoutRequest() {
  await http.post('/auth/logout')
}

export async function getAdminUsers(keyword = '', role = 'all') {
  const response = await http.get<{ data: AdminUserSummary[] } | AdminUserSummary[]>(
    '/admin/users',
    {
      params: {
        keyword,
        role,
      },
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function updateAdminUserRole(userId: string, role: 'user' | 'admin') {
  const response = await http.patch<{ data: AdminUserSummary } | AdminUserSummary>(
    `/admin/users/${userId}/role`,
    {
      role,
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getAdminDashboardStats() {
  const response = await http.get<{ data: AdminDashboardStats } | AdminDashboardStats>(
    '/admin/dashboard',
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getUserProfileSettings() {
  const response = await http.get<{ data: UserProfileSettings } | UserProfileSettings>(
    '/user/profile',
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function updateUserProfileSettings(payload: UpdateUserProfilePayload) {
  const response = await http.put<{ data: UserProfileSettings } | UserProfileSettings>(
    '/user/profile',
    payload,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function updateUserPassword(payload: UpdateUserPasswordPayload) {
  const response = await http.put<{ data: { updated: boolean } } | { updated: boolean }>(
    '/user/password',
    payload,
  )

  return 'data' in response.data ? response.data.data : response.data
}
