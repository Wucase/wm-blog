export type LoginMode = 'account' | 'phone' | 'wechat'
export type RegisterMode = 'account'

export interface AuthUser {
  id: string
  name: string
  avatarText: string
  role: 'user' | 'admin'
  token: string
}

export interface AccountLoginPayload {
  account: string
  password: string
  captcha: string
  remember: boolean
}

export interface PhoneLoginPayload {
  phone: string
  smsCode: string
}

export interface WechatLoginPayload {
  scene: 'login'
}

export interface AccountRegisterPayload {
  username: string
  phone: string
  password: string
  smsCode: string
}

export interface AuthResponse {
  user: AuthUser
}

export interface UserProfileSettings {
  id: string
  name: string
  phone: string
  avatarText: string
  role: 'user' | 'admin'
}

export interface UpdateUserProfilePayload {
  name: string
  avatarText: string
}

export interface UpdateUserPasswordPayload {
  currentPassword: string
  newPassword: string
}
