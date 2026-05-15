import type {
  AccountLoginPayload,
  AccountRegisterPayload,
  AuthResponse,
  PhoneLoginPayload,
  WechatLoginPayload,
} from '../types/auth'

function wait(ms = 220) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function buildMockUser(name: string): AuthResponse {
  return {
    user: {
      id: 'wm-user-001',
      name,
      avatarText: name.slice(0, 2).toUpperCase(),
      role: 'user',
      token: 'mock-token-wm-blog',
    },
  }
}

export async function loginWithAccountMock(payload: AccountLoginPayload) {
  await wait()

  if (payload.captcha.trim().toUpperCase() !== '4A7K') {
    throw new Error('图形验证码不正确')
  }

  if (payload.password.length < 6) {
    throw new Error('密码长度不能少于 6 位')
  }

  return buildMockUser(payload.account || 'WM User')
}

export async function loginWithPhoneMock(payload: PhoneLoginPayload) {
  await wait()

  if (payload.smsCode.trim() !== '123456') {
    throw new Error('短信验证码不正确')
  }

  return buildMockUser(`用户${payload.phone.slice(-4)}`)
}

export async function loginWithWechatMock(_payload: WechatLoginPayload) {
  await wait()
  return buildMockUser('微信用户')
}

export async function registerWithAccountMock(payload: AccountRegisterPayload) {
  await wait()

  if (!/^1\d{10}$/.test(payload.phone.trim())) {
    throw new Error('请输入正确的手机号')
  }

  if (payload.smsCode.trim() !== '123456') {
    throw new Error('短信验证码不正确')
  }

  return buildMockUser(payload.username)
}

export async function registerWithWechatMock(_payload: WechatLoginPayload) {
  await wait()
  return buildMockUser('微信新用户')
}
