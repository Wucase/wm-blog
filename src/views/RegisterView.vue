<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { registerWithAccount } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const accountForm = reactive({
  username: '',
  phone: '',
  password: '',
  smsCode: '',
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/wm')) {
    return '/wm/blog'
  }

  return redirect
})

const loginHref = computed(() => `/wm/login?redirect=${encodeURIComponent(redirectTarget.value)}`)

async function submitAccountRegister() {
  if (!accountForm.username.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }

  if (!/^1\d{10}$/.test(accountForm.phone.trim())) {
    errorMessage.value = '请输入正确的手机号'
    return
  }

  if (accountForm.password.trim().length < 6) {
    errorMessage.value = '密码长度不能少于 6 位'
    return
  }

  if (!accountForm.smsCode.trim()) {
    errorMessage.value = '请输入短信验证码'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const response = await registerWithAccount(accountForm)
    authStore.setUser(response.user)
    successMessage.value = '注册成功，正在跳转...'
    await router.push(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <main class="register-page">
    <section class="register-shell">
      <div class="register-intro">
        <p class="register-intro__eyebrow">Create WM Blog Account</p>
        <h1>注册后开始收藏、互动与创作。</h1>
        <p class="register-intro__description">
          创建 WM Blog 账号后，你可以发布自己的公开博客、管理文章、收藏喜欢的内容，并通过个人中心维护自己的创作空间。
        </p>

        <div class="register-intro__highlights">
          <article class="register-intro__card">
            <strong>账号注册</strong>
            <span>通过用户名、手机号、密码和短信验证码创建站点账号，适合长期使用。</span>
          </article>
        </div>
      </div>

      <div class="register-panel">
        <div class="register-panel__header">
          <p>欢迎加入</p>
          <h2>注册 WM Blog</h2>
        </div>

        <div class="register-tabs">
          <div class="register-tabs__item register-tabs__item--active">
            <span class="register-tabs__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
            </span>
            账号注册
          </div>
        </div>

        <div class="register-panel__stage">
          <p v-if="errorMessage" class="register-panel__message register-panel__message--error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="register-panel__message register-panel__message--success">{{ successMessage }}</p>

          <div class="register-panel__body">
            <form class="register-form" @submit.prevent="submitAccountRegister">
              <label class="register-form__field register-form__field--user">
                <span>用户名</span>
                <div class="register-form__input-wrap">
                  <span class="register-form__field-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                      <path d="M4 20a8 8 0 0 1 16 0" />
                    </svg>
                  </span>
                  <input v-model="accountForm.username" type="text" placeholder="请输入用户名" />
                </div>
              </label>

              <label class="register-form__field register-form__field--phone">
                <span>手机号</span>
                <div class="register-form__input-wrap">
                  <span class="register-form__field-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="7" y="3" width="10" height="18" rx="2" />
                      <path d="M10 6h4M11 18h2" />
                    </svg>
                  </span>
                  <input v-model="accountForm.phone" type="text" placeholder="请输入手机号" />
                </div>
              </label>

              <label class="register-form__field register-form__field--password">
                <span>密码</span>
                <div class="register-form__input-wrap">
                  <span class="register-form__field-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                  </span>
                  <input v-model="accountForm.password" type="password" placeholder="请输入密码" />
                </div>
              </label>

              <div class="register-form__field-group">
                <label class="register-form__field register-form__field--sms">
                  <span>短信验证码</span>
                  <div class="register-form__input-wrap">
                    <span class="register-form__field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="m5 8 7 5 7-5" />
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                      </svg>
                    </span>
                    <input v-model="accountForm.smsCode" type="text" placeholder="请输入短信验证码" />
                  </div>
                </label>

                <button type="button" class="register-form__captcha register-form__captcha--sms">
                  获取验证码
                </button>
              </div>

              <button type="submit" class="register-form__submit" :disabled="submitting">
                {{ submitting ? '注册中...' : '创建账号' }}
              </button>
            </form>
          </div>

          <div class="register-panel__entry-row">
            <p class="register-panel__auth-switch">
              已有账号？
              <a :href="loginHref">去登录</a>
            </p>
            <span class="register-panel__auth-switch">或者</span>
            <a class="register-panel__guest-entry" href="/wm/blog"> 先逛逛</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding: 20px 0;
}

.register-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.95fr);
  gap: var(--space-2xl);
  align-items: stretch;
}

.register-intro {
  padding: 2rem;
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at 20% 18%, rgba(247, 193, 70, 0.22), transparent 24%),
    radial-gradient(circle at 82% 24%, rgba(110, 209, 245, 0.18), transparent 28%),
    linear-gradient(145deg, rgba(9, 24, 38, 0.96), rgba(18, 44, 68, 0.94));
  box-shadow: var(--shadow-hero);
}

.register-intro__eyebrow {
  color: var(--color-accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.register-intro h1 {
  margin-top: var(--space-sm);
  color: var(--color-surface);
  font-size: clamp(1.95rem, 4vw, 3.1rem);
  line-height: 1.02;
}

.register-intro__description {
  max-width: 38rem;
  margin-top: 0.85rem;
  color: var(--color-text-inverse-soft);
  font-size: 0.95rem;
  line-height: 1.65;
}

.register-intro__highlights {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.register-intro__card {
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.08);
}

.register-intro__card strong {
  display: block;
  color: var(--color-surface);
  font-size: 0.94rem;
}

.register-intro__card span {
  display: block;
  margin-top: 0.32rem;
  color: var(--color-text-inverse-soft);
  font-size: 0.86rem;
  line-height: 1.5;
}

.register-panel {
  padding: 1.35rem;
  border: 1px solid var(--color-border-warm);
  border-radius: var(--radius-3xl);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 251, 245, 0.82));
  box-shadow: var(--shadow-soft);
}

.register-panel__stage {
  display: grid;
  align-content: start;
  gap: 1.2rem;
}

.register-panel__body {
  position: relative;
  height: 20.5rem;
  overflow: hidden;
}

.register-panel__header p {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.register-panel__header h2 {
  margin-top: var(--space-sm);
  color: var(--color-text-strong);
  font-size: clamp(1.55rem, 2.5vw, 2rem);
}

.register-panel__message {
  margin-top: var(--space-lg);
  padding: 0.78rem 0.92rem;
  border-radius: 1rem;
  font-size: 0.92rem;
}

.register-panel__message--error {
  background: rgba(193, 75, 75, 0.08);
  color: #9d3131;
}

.register-panel__message--success {
  background: rgba(73, 160, 104, 0.1);
  color: #2f7d4b;
}

.register-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.8rem;
  margin-bottom: 0.4rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: rgba(16, 42, 67, 0.06);
  isolation: isolate;
}

.register-tabs::before {
  content: '';
  position: absolute;
  top: 0.35rem;
  bottom: 0.35rem;
  left: 0.35rem;
  width: calc((100% - 0.7rem - 0.6rem) / var(--register-tab-count));
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  transform: translateX(calc(var(--register-tab-index) * (100% + 0.6rem)));
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms ease;
  z-index: 0;
}

.register-tabs__item {
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

.register-tabs__item--active {
  color: var(--color-text-strong);
}

.register-tabs__icon {
  display: inline-flex;
  width: 0.95rem;
  height: 0.95rem;
  color: currentColor;
  flex: 0 0 auto;
}

.register-tabs__icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.register-form {
  display: grid;
  gap: 0.85rem;
}

.register-form__field {
  display: grid;
  gap: 0.45rem;
  flex: 1 1 auto;
}

.register-form__field span {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.register-form__input-wrap {
  position: relative;
}

.register-form__field-icon {
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

.register-form__field-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.register-form__field input {
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

.register-form__field input:focus {
  border-color: rgba(214, 142, 52, 0.48);
  background: #fffefb;
  box-shadow: 0 0 0 4px rgba(214, 142, 52, 0.1);
}

.register-form__field-group {
  display: flex;
  align-items: end;
  gap: 0.6rem;
}

.register-form__captcha {
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

.register-form__captcha--sms {
  flex-basis: 8.8rem;
  letter-spacing: 0;
  background: var(--color-accent);
}

.register-form__submit {
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

.register-form__submit:hover {
  transform: translateY(-2px);
}

.register-form__submit:disabled {
  opacity: 0.72;
  cursor: wait;
  transform: none;
}

.wechat-register {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
}

.register-mode-enter-active,
.register-mode-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 220ms ease;
}

.register-mode-enter-from,
.register-mode-leave-to {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(3px);
}

.register-mode-enter-to,
.register-mode-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.wechat-register__qr {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.28rem;
  width: 11rem;
  height: 11rem;
  padding: 0.75rem;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.wechat-register__dot {
  border-radius: 0.24rem;
  background: rgba(16, 42, 67, 0.08);
}

.wechat-register__dot--active {
  background: var(--color-primary);
}

.wechat-register__title {
  color: var(--color-text-strong);
  font-size: 1.15rem;
  font-weight: 700;
}

.wechat-register__hint {
  max-width: 18rem;
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.6;
}

.register-panel__entry-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: nowrap;
}

.register-panel__auth-switch,
.register-panel__guest-entry {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  line-height: 1;
}

.register-panel__guest-entry {
  color: var(--color-accent-deep);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--motion-base) ease,
    transform var(--motion-base) ease;
}

.register-panel__guest-entry:hover {
  color: var(--color-primary);
  transform: translateY(-1px);
}

.register-panel__guest-entry span {
  color: var(--color-text-secondary);
  margin-right: 0.18rem;
}

.register-panel__auth-switch {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  white-space: nowrap;
}

.register-panel__auth-switch a {
  color: var(--color-accent-deep);
  font-weight: 700;
}

@media (max-width: 1080px) {
  .register-shell {
    grid-template-columns: 1fr;
  }

  .register-panel__stage {
    min-height: auto;
  }

  .register-panel__body {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 900px) {
  .register-page {
    width: min(100% - 20px, 1180px);
    min-height: auto;
    padding: 88px 0 40px;
  }

  .register-intro {
    display: none;
  }

  .register-panel {
    padding: var(--space-lg);
  }

  .register-tabs {
    border-radius: 1.2rem;
  }

  .register-form__field-group {
    display: grid;
  }

  .register-form__captcha,
  .register-form__captcha--sms {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .wechat-register__qr {
    width: min(100%, 15rem);
    height: auto;
    aspect-ratio: 1;
  }
}
</style>
