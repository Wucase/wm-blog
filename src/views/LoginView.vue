<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getWechatLoginEntryURL, loginWithAccount, loginWithPhone } from '../services/auth'
import { useAuthStore } from '../stores/auth'
import type { LoginMode } from '../types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginMode = ref<LoginMode>('account')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const accountForm = reactive({
  account: '',
  password: '',
  captcha: '',
  remember: false,
})
const phoneForm = reactive({
  phone: '',
  smsCode: '',
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/wm')) {
    return '/wm/blog'
  }

  return redirect
})

const registerHref = computed(() => `/wm/register?redirect=${encodeURIComponent(redirectTarget.value)}`)

const qrDots = computed(() =>
  Array.from({ length: 64 }, (_, index) => ({
    id: index,
    active: [0, 1, 2, 5, 7, 8, 10, 14, 15, 18, 21, 24, 25, 26, 28, 31, 34, 35, 39, 40, 42, 45, 47, 49, 50, 51, 53, 56, 58, 60, 61, 62].includes(index),
  })),
)

const loginTabStyle = computed(() => {
  const indexMap: Record<LoginMode, number> = {
    account: 0,
    phone: 1,
    wechat: 2,
  }

  return {
    '--login-tab-count': '3',
    '--login-tab-index': String(indexMap[loginMode.value]),
  }
})

function switchMode(mode: LoginMode) {
  loginMode.value = mode
  errorMessage.value = ''
  successMessage.value = ''
}

function startWechatLogin() {
  const query = new URLSearchParams({
    redirect: redirectTarget.value,
  })
  window.location.href = `${getWechatLoginEntryURL()}?${query.toString()}`
}

async function submitAccountLogin() {
  if (!accountForm.account.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }

  if (accountForm.password.trim().length < 6) {
    errorMessage.value = '密码长度不能少于 6 位'
    return
  }

  if (!accountForm.captcha.trim()) {
    errorMessage.value = '请输入图形验证码'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const response = await loginWithAccount(accountForm)
    authStore.setUser(response.user)
    successMessage.value = '登录成功，正在跳转...'
    await router.push(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

async function submitPhoneLogin() {
  if (!/^1\d{10}$/.test(phoneForm.phone.trim())) {
    errorMessage.value = '请输入正确的手机号'
    return
  }

  if (!phoneForm.smsCode.trim()) {
    errorMessage.value = '请输入短信验证码'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const response = await loginWithPhone(phoneForm)
    authStore.setUser(response.user)
    successMessage.value = '登录成功，正在跳转...'
    await router.push(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <main class="login-page">
    <section class="login-shell">
      <div class="login-intro">
        <p class="login-intro__eyebrow">WM Blog Account</p>
        <h1>登录后继续阅读、收藏与创作。</h1>
        <p class="login-intro__description">
          登录 WM Blog 后，你可以继续管理自己的文章、收藏公开博客、参与评论互动，并在公开文章页与创作空间之间自由切换。
        </p>

        <div class="login-intro__highlights">
          <article class="login-intro__card">
            <strong>账号密码登录</strong>
            <span>适合已有账号用户，支持用户名 + 密码 + 图形验证码。</span>
          </article>
          <article class="login-intro__card">
            <strong>手机号验证码登录</strong>
            <span>适合快速进入站点，无需手动输入密码。</span>
          </article>
          <article class="login-intro__card">
            <strong>微信扫码登录</strong>
            <span>游客和移动端用户都容易理解，适合做站点快速登录入口。</span>
          </article>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-panel__header">
          <p>欢迎回来</p>
          <h2>登录 WM Blog</h2>
        </div>

        <div class="login-tabs" :style="loginTabStyle">
          <button type="button" class="login-tabs__item"
            :class="{ 'login-tabs__item--active': loginMode === 'account' }" @click="switchMode('account')">
            <span class="login-tabs__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
            </span>
            账号登录
          </button>
          <button type="button" class="login-tabs__item" :class="{ 'login-tabs__item--active': loginMode === 'phone' }"
            @click="switchMode('phone')">
            <span class="login-tabs__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="7" y="3" width="10" height="18" rx="2" />
                <path d="M10 6h4M11 18h2" />
              </svg>
            </span>
            手机号登录
          </button>
          <button type="button" class="login-tabs__item" :class="{ 'login-tabs__item--active': loginMode === 'wechat' }"
            @click="switchMode('wechat')">
            <span class="login-tabs__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M8.5 14.5c-2.5 0-4.5-1.8-4.5-4s2-4 4.5-4c2.48 0 4.5 1.8 4.5 4 0 .68-.2 1.32-.56 1.87L13 15l-2.42-1.02c-.64.34-1.35.52-2.08.52Z" />
                <path d="M15.5 17.5c2.5 0 4.5-1.8 4.5-4s-2-4-4.5-4c-1.16 0-2.22.4-3.03 1.06" />
              </svg>
            </span>
            微信扫码
          </button>
        </div>

        <div class="login-panel__stage">
          <p v-if="errorMessage" class="login-panel__message login-panel__message--error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="login-panel__message login-panel__message--success">{{ successMessage }}</p>

          <div class="login-panel__body">
            <Transition name="login-mode" mode="out-in">
              <form v-if="loginMode === 'account'" key="account" class="login-form"
                @submit.prevent="submitAccountLogin">
                <label class="login-form__field login-form__field--user">
                  <span>用户名</span>
                  <div class="login-form__input-wrap">
                    <span class="login-form__field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                        <path d="M4 20a8 8 0 0 1 16 0" />
                      </svg>
                    </span>
                    <input v-model="accountForm.account" type="text" placeholder="请输入用户名" />
                  </div>
                </label>

                <label class="login-form__field login-form__field--password">
                  <span>密码</span>
                  <div class="login-form__input-wrap">
                    <span class="login-form__field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="9" rx="2" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                      </svg>
                    </span>
                    <input v-model="accountForm.password" type="password" placeholder="请输入密码" />
                  </div>
                </label>

                <div class="login-form__field-group">
                  <label class="login-form__field login-form__field--captcha">
                    <span>图形验证码</span>
                    <div class="login-form__input-wrap">
                      <span class="login-form__field-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M7 8h10M7 12h6M7 16h4" />
                          <rect x="4" y="4" width="16" height="16" rx="3" />
                        </svg>
                      </span>
                      <input v-model="accountForm.captcha" type="text" placeholder="请输入验证码" />
                    </div>
                  </label>

                  <button type="button" class="login-form__captcha">4A7K</button>
                </div>

                <div class="login-form__meta">
                  <label class="login-form__remember">
                    <input v-model="accountForm.remember" type="checkbox" />
                    <span>记住我</span>
                  </label>

                  <a href="/wm/forgot-password">忘记密码</a>
                </div>

                <button type="submit" class="login-form__submit" :disabled="submitting">
                  {{ submitting ? '登录中...' : '账号登录' }}
                </button>

                <p class="login-form__register">
                  还没有账号？
                  <a :href="registerHref">立即注册</a>
                </p>
              </form>

              <form v-else-if="loginMode === 'phone'" key="phone" class="login-form" @submit.prevent="submitPhoneLogin">
                <label class="login-form__field login-form__field--phone">
                  <span>手机号</span>
                  <div class="login-form__input-wrap">
                    <span class="login-form__field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="7" y="3" width="10" height="18" rx="2" />
                        <path d="M10 6h4M11 18h2" />
                      </svg>
                    </span>
                    <input v-model="phoneForm.phone" type="text" placeholder="请输入手机号" />
                  </div>
                </label>

                <div class="login-form__field-group">
                  <label class="login-form__field login-form__field--sms">
                    <span>短信验证码</span>
                    <div class="login-form__input-wrap">
                      <span class="login-form__field-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="m5 8 7 5 7-5" />
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                        </svg>
                      </span>
                      <input v-model="phoneForm.smsCode" type="text" placeholder="请输入短信验证码" />
                    </div>
                  </label>

                  <button type="button" class="login-form__captcha login-form__captcha--sms">
                    获取验证码
                  </button>
                </div>

                <div class="login-form__meta login-form__meta--single">
                  <span>手机号验证后可快速进入。</span>
                </div>

                <button type="submit" class="login-form__submit" :disabled="submitting">
                  {{ submitting ? '登录中...' : '手机号登录' }}
                </button>
              </form>

              <div v-else key="wechat" class="wechat-login">
                <button type="button" class="wechat-login__qr" @click="startWechatLogin">
                  <div v-for="dot in qrDots" :key="dot.id" class="wechat-login__dot"
                    :class="{ 'wechat-login__dot--active': dot.active }"></div>
                </button>

                <p class="wechat-login__title">微信扫码登录</p>
                <span class="wechat-login__hint">请使用微信扫描二维码，完成授权后自动登录。</span>
              </div>
            </Transition>
          </div>

          <div class="login-panel__entry-row">
            <p class="login-panel__auth-switch">
              没有账号？
              <a :href="registerHref">去注册</a>
            </p>
            <span class="login-panel__auth-switch">或者</span>

            <a class="login-panel__guest-entry" href="/wm/blog">先逛逛</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding: 20px 0;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.95fr);
  gap: var(--space-2xl);
  align-items: stretch;
}

.login-intro {
  padding: 2rem;
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at 20% 18%, rgba(247, 193, 70, 0.22), transparent 24%),
    radial-gradient(circle at 82% 24%, rgba(110, 209, 245, 0.18), transparent 28%),
    linear-gradient(145deg, rgba(9, 24, 38, 0.96), rgba(18, 44, 68, 0.94));
  box-shadow: var(--shadow-hero);
}

.login-intro__eyebrow {
  color: var(--color-accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.login-intro h1 {
  margin-top: var(--space-sm);
  color: var(--color-surface);
  font-size: clamp(1.95rem, 4vw, 3.1rem);
  line-height: 1.02;
}

.login-intro__description {
  max-width: 38rem;
  margin-top: 0.85rem;
  color: var(--color-text-inverse-soft);
  font-size: 0.95rem;
  line-height: 1.65;
}

.login-intro__highlights {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.login-intro__card {
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.08);
}

.login-intro__card strong {
  display: block;
  color: var(--color-surface);
  font-size: 0.94rem;
}

.login-intro__card span {
  display: block;
  margin-top: 0.32rem;
  color: var(--color-text-inverse-soft);
  font-size: 0.86rem;
  line-height: 1.5;
}

.login-panel {
  padding: 1.35rem;
  border: 1px solid var(--color-border-warm);
  border-radius: var(--radius-3xl);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 251, 245, 0.82));
  box-shadow: var(--shadow-soft);
}

.login-panel__stage {
  display: grid;
  align-content: start;
  gap: 1.2rem;
}

.login-panel__body {
  position: relative;
  height: 21.25rem;
  overflow: hidden;
}

.login-panel__header p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-panel__header h2 {
  margin-top: var(--space-sm);
  color: var(--color-text-strong);
  font-size: clamp(1.55rem, 2.5vw, 2rem);
}

.login-panel__header span {
  display: block;
  margin-top: 0.4rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.55;
}

.login-panel__message {
  margin-top: var(--space-lg);
  padding: 0.78rem 0.92rem;
  border-radius: 1rem;
  font-size: 0.92rem;
}

.login-panel__message--error {
  background: rgba(193, 75, 75, 0.08);
  color: #9d3131;
}

.login-panel__message--success {
  background: rgba(73, 160, 104, 0.1);
  color: #2f7d4b;
}

.login-panel__entry-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: nowrap;
}

.login-panel__auth-switch,
.login-panel__guest-entry {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  line-height: 1;
}

.login-panel__guest-entry {
  color: var(--color-accent-deep);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--motion-base) ease,
    transform var(--motion-base) ease;
}

.login-panel__guest-entry:hover {
  color: var(--color-primary);
  transform: translateY(-1px);
}

.login-panel__guest-entry span {
  color: var(--color-text-secondary);
  margin-right: 0.18rem;
}

.login-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.8rem;
  margin-bottom: 0.4rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.06);
  isolation: isolate;
}

.login-tabs::before {
  content: '';
  position: absolute;
  top: 0.35rem;
  bottom: 0.35rem;
  left: 0.35rem;
  width: calc((100% - 0.7rem - 1.2rem) / var(--login-tab-count));
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  transform: translateX(calc(var(--login-tab-index) * (100% + 0.6rem)));
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms ease;
  z-index: 0;
}

.login-tabs__item {
  position: relative;
  z-index: 1;
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 0.62rem;
  background: transparent;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.38rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--motion-base) ease,
    color var(--motion-base) ease,
    transform var(--motion-base) ease;
}

.login-tabs__item--active {
  color: var(--color-text-strong);
}

.login-tabs__icon {
  display: inline-flex;
  width: 0.95rem;
  height: 0.95rem;
  color: currentColor;
  flex: 0 0 auto;
}

.login-tabs__icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-form {
  display: grid;
  gap: 0.85rem;
}

.login-form__field {
  display: grid;
  gap: 0.45rem;
  flex: 1 1 auto;
}

.login-form__field span {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.login-form__input-wrap {
  position: relative;
}

.login-form__field-icon {
  position: absolute;
  top: 50%;
  left: 0.78rem;
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  color: rgba(16, 42, 67, 0.46);
  transform: translateY(-50%);
  pointer-events: none;
}

.login-form__field-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-form__field input {
  width: 100%;
  border: 1px solid rgba(16, 42, 67, 0.1);
  border-radius: 1rem;
  min-height: 2.5rem;
  padding: 0.54rem 0.76rem 0.54rem 2.35rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-strong);
  font: inherit;
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease,
    background-color var(--motion-base) ease;
}

.login-form__field input:focus {
  border-color: rgba(214, 142, 52, 0.48);
  background: #fffefb;
  box-shadow: 0 0 0 4px rgba(214, 142, 52, 0.1);
}

.login-form__field-group {
  display: flex;
  align-items: end;
  gap: 0.6rem;
}

.login-form__captcha {
  flex: 0 0 7rem;
  height: 2.5rem;
  border: 0;
  border-radius: 1rem;
  background:
    linear-gradient(145deg, rgba(16, 42, 67, 0.92), rgba(29, 74, 111, 0.94));
  color: #fff;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.18em;
  cursor: pointer;
}

.login-form__captcha--sms {
  flex-basis: 8.8rem;
  letter-spacing: 0;
  background: var(--color-accent);
}

.login-form__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  color: var(--color-text-secondary);
  font-size: 0.84rem;
}

.login-form__meta--single {
  justify-content: start;
}

.login-form__remember {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.login-form__submit {
  width: 100%;
  border: 0;
  border-radius: 999px;
  min-height: 2.5rem;
  padding: 0.54rem 0.9rem;
  background: var(--color-accent);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition:
    transform var(--motion-base) ease,
    opacity var(--motion-base) ease;
}

.login-form__submit:hover {
  transform: translateY(-2px);
}

.login-form__submit:disabled {
  opacity: 0.72;
  cursor: wait;
  transform: none;
}

.login-form__register {
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 0.88rem;
  line-height: 1.6;
}

.login-form__register a,
.login-form__meta a {
  color: var(--color-accent-deep);
  font-weight: 700;
}

.login-panel__auth-switch {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  white-space: nowrap;
}

.login-panel__auth-switch a {
  color: var(--color-accent-deep);
  font-weight: 700;
}

.wechat-login {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
}

.login-mode-enter-active,
.login-mode-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 220ms ease;
}

.login-mode-enter-from,
.login-mode-leave-to {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(3px);
}

.login-mode-enter-to,
.login-mode-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.wechat-login__qr {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.28rem;
  width: 11rem;
  height: 11rem;
  padding: 0.75rem;
  border: 0;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform var(--motion-base) ease;
}

.wechat-login__qr:hover {
  transform: translateY(-2px);
}

.wechat-login__dot {
  border-radius: 0.24rem;
  background: rgba(16, 42, 67, 0.08);
}

.wechat-login__dot--active {
  background: var(--color-primary);
}

.wechat-login__title {
  color: var(--color-text-strong);
  font-size: 1.15rem;
  font-weight: 700;
}

.wechat-login__hint {
  max-width: 18rem;
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.6;
}

.wechat-login__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
}

.wechat-login__tips span {
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.06);
  color: var(--color-primary);
  font-size: 0.76rem;
}

@media (max-width: 1080px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-panel__stage {
    min-height: auto;
  }

  .login-panel__body {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 900px) {
  .login-page {
    width: min(100% - 20px, 1180px);
    min-height: auto;
    padding: 88px 0 40px;
  }

  .login-intro {
    display: none;
  }

  .login-panel {
    padding: var(--space-lg);
  }

  .login-tabs {
    border-radius: 1.2rem;
  }

  .login-form__field-group {
    display: grid;
  }

  .login-form__captcha,
  .login-form__captcha--sms {
    width: 100%;
  }

  .login-form__meta {
    display: grid;
    justify-content: start;
  }
}

@media (max-width: 720px) {
  .wechat-login__qr {
    width: min(100%, 15rem);
    height: auto;
    aspect-ratio: 1;
  }
}
</style>
