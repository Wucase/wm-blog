<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'

import AdminManageNav from '../components/admin/AdminManageNav.vue'
import { homePageMockData } from '../data/home'
import {
  getAdminHomePageSettings,
  resetAdminHomePageSettings,
  saveAdminHomePageSettings,
} from '../services/homeSettings'
import type { FeaturedPost, HomePageData } from '../types/home'

const loading = ref(true)
const editingKey = ref<string | null>(null)
const savingKey = ref<string | null>(null)
const saveMessage = ref('')
const formData = ref<HomePageData>(structuredClone(homePageMockData))
const persistedData = ref<HomePageData>(structuredClone(homePageMockData))
const editSnapshots = ref<Record<string, unknown>>({})

const featuredPosts = computed(() => formData.value.featuredPosts)

function cloneSnapshot<T>(value: T): T {
  return structuredClone(toRaw(value))
}

async function loadPageData() {
  try {
    const data = cloneSnapshot(await getAdminHomePageSettings())
    formData.value = cloneSnapshot(data)
    persistedData.value = cloneSnapshot(data)
  } finally {
    loading.value = false
  }
}

function startEdit(key: string) {
  if (!editSnapshots.value[key]) {
    editSnapshots.value[key] = getBlockSnapshot(key)
  }

  editingKey.value = key
  saveMessage.value = ''
}

function isEditing(key: string) {
  return editingKey.value === key
}

function getBlockSnapshot(key: string) {
  switch (key) {
    case 'nav-brand':
      return cloneSnapshot(formData.value.nav.brand)
    case 'nav-actions':
      return cloneSnapshot(formData.value.nav.actions)
    case 'hero-eyebrow':
      return formData.value.hero.eyebrow
    case 'hero-title':
      return formData.value.hero.title
    case 'hero-description':
      return formData.value.hero.description
    case 'hero-card':
      return cloneSnapshot({
        badge: formData.value.hero.stage.badge,
        title: formData.value.hero.stage.title,
        description: formData.value.hero.stage.description,
      })
    case 'about-main':
      return cloneSnapshot({
        title: formData.value.about.title,
        description: formData.value.about.description,
      })
    case 'footer':
      return cloneSnapshot(formData.value.footer)
    default:
      if (key.startsWith('featured-')) {
        const index = Number(key.replace('featured-', ''))
        return Number.isNaN(index) ? null : cloneSnapshot(formData.value.featuredPosts[index])
      }

      if (key.startsWith('about-card-')) {
        const index = Number(key.replace('about-card-', ''))
        return Number.isNaN(index) ? null : cloneSnapshot(formData.value.about.cards[index])
      }

      return null
  }
}

function restoreBlockFromSnapshot(key: string, snapshot: unknown) {
  if (!snapshot) {
    syncBlockFromSource(key, persistedData.value)
    return
  }

  switch (key) {
    case 'nav-brand':
      formData.value.nav.brand = cloneSnapshot(snapshot as HomePageData['nav']['brand'])
      break
    case 'nav-actions':
      formData.value.nav.actions = cloneSnapshot(snapshot as HomePageData['nav']['actions'])
      break
    case 'hero-eyebrow':
      formData.value.hero.eyebrow = snapshot as string
      break
    case 'hero-title':
      formData.value.hero.title = snapshot as string
      break
    case 'hero-description':
      formData.value.hero.description = snapshot as string
      break
    case 'hero-card': {
      const block = snapshot as { badge: string; title: string; description: string }
      formData.value.hero.stage.badge = block.badge
      formData.value.hero.stage.title = block.title
      formData.value.hero.stage.description = block.description
      break
    }
    case 'about-main': {
      const block = snapshot as { title: string; description: string }
      formData.value.about.title = block.title
      formData.value.about.description = block.description
      break
    }
    case 'footer':
      formData.value.footer = cloneSnapshot(snapshot as HomePageData['footer'])
      break
    default:
      if (key.startsWith('featured-')) {
        const index = Number(key.replace('featured-', ''))
        if (!Number.isNaN(index) && snapshot) {
          formData.value.featuredPosts[index] = cloneSnapshot(snapshot as FeaturedPost)
        }
      }

      if (key.startsWith('about-card-')) {
        const index = Number(key.replace('about-card-', ''))
        if (!Number.isNaN(index) && snapshot) {
          formData.value.about.cards[index] = cloneSnapshot(snapshot as HomePageData['about']['cards'][number])
        }
      }
      break
  }
}

function syncBlockFromSource(key: string, source: HomePageData) {
  switch (key) {
    case 'nav-brand':
      formData.value.nav.brand = cloneSnapshot(source.nav.brand)
      break
    case 'nav-actions':
      formData.value.nav.actions = cloneSnapshot(source.nav.actions)
      break
    case 'hero-eyebrow':
      formData.value.hero.eyebrow = source.hero.eyebrow
      break
    case 'hero-title':
      formData.value.hero.title = source.hero.title
      break
    case 'hero-description':
      formData.value.hero.description = source.hero.description
      break
    case 'hero-card':
      formData.value.hero.stage.badge = source.hero.stage.badge
      formData.value.hero.stage.title = source.hero.stage.title
      formData.value.hero.stage.description = source.hero.stage.description
      break
    case 'about-main':
      formData.value.about.title = source.about.title
      formData.value.about.description = source.about.description
      break
    case 'footer':
      formData.value.footer = cloneSnapshot(source.footer)
      break
    default:
      if (key.startsWith('featured-')) {
        const index = Number(key.replace('featured-', ''))
        if (!Number.isNaN(index) && source.featuredPosts[index]) {
          formData.value.featuredPosts[index] = cloneSnapshot(source.featuredPosts[index])
        }
      }

      if (key.startsWith('about-card-')) {
        const index = Number(key.replace('about-card-', ''))
        if (!Number.isNaN(index) && source.about.cards[index]) {
          formData.value.about.cards[index] = cloneSnapshot(source.about.cards[index])
        }
      }
      break
  }
}

function cancelEdit(key: string) {
  restoreBlockFromSnapshot(key, editSnapshots.value[key])
  delete editSnapshots.value[key]
  editingKey.value = null
  saveMessage.value = ''
}

function toggleTextEdit(key: string) {
  if (isEditing(key)) {
    cancelEdit(key)
    return
  }

  startEdit(key)
}

function handleEditableShellClick(event: MouseEvent, key: string) {
  const target = event.target as HTMLElement | null

  if (target?.closest('button, input, textarea, label, a')) {
    return
  }

  if (!isEditing(key)) {
    startEdit(key)
  }
}

async function saveBlock(key: string, label: string) {
  savingKey.value = key

  try {
    const data = cloneSnapshot(await saveAdminHomePageSettings(formData.value))
    formData.value = cloneSnapshot(data)
    persistedData.value = cloneSnapshot(data)
    delete editSnapshots.value[key]
    editingKey.value = null
    saveMessage.value = `${label}已保存到服务器。`
  } finally {
    savingKey.value = null
  }
}

function handleReset() {
  const data = cloneSnapshot(resetAdminHomePageSettings())
  formData.value = cloneSnapshot(data)
  persistedData.value = cloneSnapshot(data)
  editSnapshots.value = {}
  editingKey.value = null
  saveMessage.value = '已重置当前配置。'
}

function handleImageFileChange(event: Event, updater: (value: string) => void) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    const result = reader.result

    if (typeof result === 'string') {
      // 选图后先直接替换当前预览图，保存按钮只负责提交到服务端。
      updater(result)
      saveMessage.value = ''
    }

    // 清空 input，保证重复选择同一张图片时也能触发 change。
    input.value = ''
  }

  reader.readAsDataURL(file)
}

function updateFeaturedPost(index: number, updater: (post: FeaturedPost) => void) {
  const targetPost = formData.value.featuredPosts[index]

  if (!targetPost) {
    return
  }

  updater(targetPost)
}

onMounted(() => {
  loadPageData()
})
</script>

<template>
  <main class="admin-home">
    <header class="admin-toolbar">
      <div>
        <p>Admin Home Editor</p>
        <h1>honeViewSetting</h1>
        <span>管理员视角下的首页编辑页。每个文字块和图片块都可以单独修改并保存。</span>
      </div>

      <div class="admin-toolbar__actions">
        <button type="button" class="ghost" @click="handleReset">恢复默认</button>
      </div>
    </header>

    <AdminManageNav />

    <div v-if="loading" class="admin-loading">管理员首页配置加载中...</div>

    <template v-else>
      <p v-if="saveMessage" class="admin-message">{{ saveMessage }}</p>

      <section class="admin-nav">
        <div class="admin-nav__inner">
          <div
            class="admin-nav__brand editable-shell"
            :class="{ 'editable-shell--active': isEditing('nav-brand') }"
            @click="handleEditableShellClick($event, 'nav-brand')"
          >
            <span v-if="!isEditing('nav-brand')" class="admin-nav__logo">{{ formData.nav.brand.logoText }}</span>
            <input
              v-else
              v-model="formData.nav.brand.logoText"
              type="text"
              class="inline-input inline-input--logo"
            />

            <div class="admin-nav__brand-copy">
              <strong v-if="!isEditing('nav-brand')">{{ formData.nav.brand.name }}</strong>
              <input
                v-else
                v-model="formData.nav.brand.name"
                type="text"
                class="inline-input"
              />
              <small v-if="!isEditing('nav-brand')">{{ formData.nav.brand.subTitle }}</small>
              <input
                v-else
                v-model="formData.nav.brand.subTitle"
                type="text"
                class="inline-input inline-input--sub"
              />
            </div>

            <div class="inline-actions inline-actions--text">
              <button type="button" class="editor-btn" @click="toggleTextEdit('nav-brand')">
                {{ isEditing('nav-brand') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'nav-brand'"
                @click="saveBlock('nav-brand', '导航栏品牌信息')"
              >
                {{ savingKey === 'nav-brand' ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

          <nav
            class="admin-nav__actions editable-shell"
            :class="{ 'editable-shell--active': isEditing('nav-actions') }"
            @click="handleEditableShellClick($event, 'nav-actions')"
          >
            <a v-if="!isEditing('nav-actions')" href="javascript:void(0)" class="ghost-link">
              {{ formData.nav.actions[0].label }}
            </a>
            <input
              v-else
              v-model="formData.nav.actions[0].label"
              type="text"
              class="inline-input inline-input--button"
            />
            <a v-if="!isEditing('nav-actions')" href="javascript:void(0)" class="solid-link">
              {{ formData.nav.actions[1].label }}
            </a>
            <input
              v-else
              v-model="formData.nav.actions[1].label"
              type="text"
              class="inline-input inline-input--button inline-input--button-solid"
            />
            <div class="inline-actions inline-actions--text">
              <button type="button" class="editor-btn" @click="toggleTextEdit('nav-actions')">
                {{ isEditing('nav-actions') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'nav-actions'"
                @click="saveBlock('nav-actions', '导航栏按钮')"
              >
                {{ savingKey === 'nav-actions' ? '保存中...' : '保存' }}
              </button>
            </div>
          </nav>
        </div>

      </section>

      <section class="admin-hero">
        <div class="admin-hero__copy">
          <div
            class="editable-line editable-shell"
            :class="{ 'editable-shell--active': isEditing('hero-eyebrow') }"
            @click="handleEditableShellClick($event, 'hero-eyebrow')"
          >
            <p v-if="!isEditing('hero-eyebrow')" class="eyebrow">{{ formData.hero.eyebrow }}</p>
            <input
              v-else
              v-model="formData.hero.eyebrow"
              type="text"
              class="inline-input inline-input--hero-meta"
            />
            <div class="inline-actions inline-actions--text">
              <button type="button" class="editor-btn" @click="toggleTextEdit('hero-eyebrow')">
                {{ isEditing('hero-eyebrow') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'hero-eyebrow'"
                @click="saveBlock('hero-eyebrow', '首屏小标题')"
              >
                {{ savingKey === 'hero-eyebrow' ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

          <div
            class="editable-line editable-shell"
            :class="{ 'editable-shell--active': isEditing('hero-title') }"
            @click="handleEditableShellClick($event, 'hero-title')"
          >
            <h2 v-if="!isEditing('hero-title')" class="hero-title">{{ formData.hero.title }}</h2>
            <textarea
              v-else
              v-model="formData.hero.title"
              rows="2"
              class="inline-input inline-input--hero-title"
            ></textarea>
            <div class="inline-actions inline-actions--text">
              <button type="button" class="editor-btn" @click="toggleTextEdit('hero-title')">
                {{ isEditing('hero-title') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'hero-title'"
                @click="saveBlock('hero-title', '首屏主标题')"
              >
                {{ savingKey === 'hero-title' ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

          <div
            class="editable-line editable-shell"
            :class="{ 'editable-shell--active': isEditing('hero-description') }"
            @click="handleEditableShellClick($event, 'hero-description')"
          >
            <p v-if="!isEditing('hero-description')" class="hero-description">{{ formData.hero.description }}</p>
            <textarea
              v-else
              v-model="formData.hero.description"
              rows="5"
              class="inline-input inline-input--hero-description"
            ></textarea>
            <div class="inline-actions inline-actions--text">
              <button type="button" class="editor-btn" @click="toggleTextEdit('hero-description')">
                {{ isEditing('hero-description') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'hero-description'"
                @click="saveBlock('hero-description', '首屏描述')"
              >
                {{ savingKey === 'hero-description' ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

        </div>

        <div class="admin-hero__visual">
          <article
            class="hero-note-card editable-shell"
            :class="{ 'editable-shell--active': isEditing('hero-card') }"
            @click="handleEditableShellClick($event, 'hero-card')"
          >
            <div v-if="!isEditing('hero-card')" class="hero-note-card__badge">{{ formData.hero.stage.badge }}</div>
            <input
              v-else
              v-model="formData.hero.stage.badge"
              type="text"
              class="inline-input inline-input--badge"
            />
            <h3 v-if="!isEditing('hero-card')">{{ formData.hero.stage.title }}</h3>
            <textarea
              v-else
              v-model="formData.hero.stage.title"
              rows="2"
              class="inline-input inline-input--card-title"
            ></textarea>
            <p v-if="!isEditing('hero-card')">{{ formData.hero.stage.description }}</p>
            <textarea
              v-else
              v-model="formData.hero.stage.description"
              rows="4"
              class="inline-input inline-input--card-desc"
            ></textarea>
            <div class="inline-actions inline-actions--text inline-actions--compact">
              <button type="button" class="editor-btn" @click="toggleTextEdit('hero-card')">
                {{ isEditing('hero-card') ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === 'hero-card'"
                @click="saveBlock('hero-card', '首屏浮层文案')"
              >
                {{ savingKey === 'hero-card' ? '保存中...' : '保存' }}
              </button>
            </div>
          </article>

          <div class="hero-images">
            <article class="hero-image-card">
              <img :src="formData.hero.stage.leftCardImage" :alt="formData.hero.stage.leftCardAlt" />
              <div class="inline-actions inline-actions--image">
                <label class="editor-btn editor-btn--solid editor-btn--file">
                  重新上传
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageFileChange($event, (value) => (formData.hero.stage.leftCardImage = value))"
                  />
                </label>
                <button
                  type="button"
                  class="editor-btn editor-btn--solid"
                  :disabled="savingKey === 'hero-left-image'"
                  @click="saveBlock('hero-left-image', '首屏左图')"
                >
                  {{ savingKey === 'hero-left-image' ? '保存中...' : '保存' }}
                </button>
              </div>
            </article>

            <article class="hero-image-card">
              <img :src="formData.hero.stage.rightCardImage" :alt="formData.hero.stage.rightCardAlt" />
              <div class="inline-actions inline-actions--image">
                <label class="editor-btn editor-btn--solid editor-btn--file">
                  重新上传
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageFileChange($event, (value) => (formData.hero.stage.rightCardImage = value))"
                  />
                </label>
                <button
                  type="button"
                  class="editor-btn editor-btn--solid"
                  :disabled="savingKey === 'hero-right-image'"
                  @click="saveBlock('hero-right-image', '首屏右图')"
                >
                  {{ savingKey === 'hero-right-image' ? '保存中...' : '保存' }}
                </button>
              </div>
            </article>
          </div>

        </div>
      </section>

      <section class="admin-featured">
        <div class="section-heading">
          <p>Featured Articles</p>
          <h2>欢迎从这几篇开始认识 WM Blog</h2>
        </div>

        <div class="featured-grid">
          <article
            v-for="(post, index) in featuredPosts"
            :key="`${post.title}-${index}`"
            class="featured-card"
          >
            <div class="featured-card__media">
              <img :src="post.image" :alt="post.title" class="featured-card__image" />
              <div class="inline-actions inline-actions--image inline-actions--image-card">
                <label class="editor-btn editor-btn--solid editor-btn--file">
                  重新上传
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageFileChange($event, (value) => updateFeaturedPost(index, (target) => { target.image = value }))"
                  />
                </label>
                <button
                  type="button"
                  class="editor-btn editor-btn--solid"
                  :disabled="savingKey === `featured-image-${index}`"
                  @click="saveBlock(`featured-image-${index}`, `推荐卡片图片 ${index + 1}`)"
                >
                  {{ savingKey === `featured-image-${index}` ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
            <div
              class="featured-card__content editable-shell editable-shell--column"
              :class="{ 'editable-shell--active': isEditing(`featured-${index}`) }"
              @click.stop="handleEditableShellClick($event, `featured-${index}`)"
            >
              <span v-if="!isEditing(`featured-${index}`)">{{ post.tag }}</span>
              <input
                v-else
                v-model="post.tag"
                type="text"
                class="inline-input inline-input--tag"
              />
              <h3 v-if="!isEditing(`featured-${index}`)">{{ post.title }}</h3>
              <textarea
                v-else
                v-model="post.title"
                rows="2"
                class="inline-input inline-input--card-title"
              ></textarea>
              <p v-if="!isEditing(`featured-${index}`)">{{ post.summary }}</p>
              <textarea
                v-else
                v-model="post.summary"
                rows="4"
                class="inline-input inline-input--card-desc"
              ></textarea>
              <div class="inline-actions inline-actions--text">
                <button type="button" class="editor-btn" @mousedown.stop @click.stop="toggleTextEdit(`featured-${index}`)">
                  {{ isEditing(`featured-${index}`) ? '取消' : '修改' }}
                </button>
                <button
                  type="button"
                  class="editor-btn editor-btn--solid"
                  :disabled="savingKey === `featured-${index}`"
                  @mousedown.stop
                  @click.stop="saveBlock(`featured-${index}`, `推荐卡片 ${index + 1}`)"
                >
                  {{ savingKey === `featured-${index}` ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="admin-about">
        <div
          class="admin-about__copy editable-shell editable-shell--column"
          :class="{ 'editable-shell--active': isEditing('about-main') }"
          @click="handleEditableShellClick($event, 'about-main')"
        >
          <p>{{ formData.about.eyebrow }}</p>
          <h2 v-if="!isEditing('about-main')">{{ formData.about.title }}</h2>
          <textarea
            v-else
            v-model="formData.about.title"
            rows="2"
            class="inline-input inline-input--about-title"
          ></textarea>
          <p v-if="!isEditing('about-main')" class="admin-about__text">{{ formData.about.description }}</p>
          <textarea
            v-else
            v-model="formData.about.description"
            rows="5"
            class="inline-input inline-input--about-desc"
          ></textarea>
          <div class="inline-actions inline-actions--text">
            <button type="button" class="editor-btn" @click="toggleTextEdit('about-main')">
              {{ isEditing('about-main') ? '取消' : '修改' }}
            </button>
            <button
              type="button"
              class="editor-btn editor-btn--solid"
              :disabled="savingKey === 'about-main'"
              @click="saveBlock('about-main', 'About 区主内容')"
            >
              {{ savingKey === 'about-main' ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>

        <div class="admin-about__cards">
          <article
            v-for="(card, index) in formData.about.cards"
            :key="card.label"
            class="about-mini-card editable-shell editable-shell--column"
            :class="{ 'editable-shell--active': isEditing(`about-card-${index}`) }"
            @click="handleEditableShellClick($event, `about-card-${index}`)"
          >
            <span v-if="!isEditing(`about-card-${index}`)">{{ card.label }}</span>
            <input
              v-else
              v-model="card.label"
              type="text"
              class="inline-input inline-input--tag"
            />
            <strong v-if="!isEditing(`about-card-${index}`)">{{ card.value }}</strong>
            <textarea
              v-else
              v-model="card.value"
              rows="3"
              class="inline-input inline-input--card-desc"
            ></textarea>
            <div class="inline-actions inline-actions--text inline-actions--compact">
              <button type="button" class="editor-btn" @click="toggleTextEdit(`about-card-${index}`)">
                {{ isEditing(`about-card-${index}`) ? '取消' : '修改' }}
              </button>
              <button
                type="button"
                class="editor-btn editor-btn--solid"
                :disabled="savingKey === `about-card-${index}`"
                @click="saveBlock(`about-card-${index}`, `About 卡片 ${index + 1}`)"
              >
                {{ savingKey === `about-card-${index}` ? '保存中...' : '保存' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="admin-footer">
        <div
          class="admin-footer__content editable-shell editable-shell--column"
          :class="{ 'editable-shell--active': isEditing('footer') }"
          @click="handleEditableShellClick($event, 'footer')"
        >
          <p v-if="!isEditing('footer')">{{ formData.footer.copyright }}</p>
          <input
            v-else
            v-model="formData.footer.copyright"
            type="text"
            class="inline-input inline-input--footer"
          />
          <a v-if="!isEditing('footer')" :href="formData.footer.beian?.href" target="_blank" rel="noreferrer">
            {{ formData.footer.beian?.label }}
          </a>
          <input
            v-else
            v-model="formData.footer.beian!.label"
            type="text"
            class="inline-input inline-input--footer"
          />
          <input
            v-if="isEditing('footer')"
            v-model="formData.footer.beian!.href"
            type="text"
            class="inline-input inline-input--footer-link"
          />
          <div class="inline-actions inline-actions--text inline-actions--center">
            <button type="button" class="editor-btn" @click="toggleTextEdit('footer')">
              {{ isEditing('footer') ? '取消' : '修改' }}
            </button>
            <button
              type="button"
              class="editor-btn editor-btn--solid"
              :disabled="savingKey === 'footer'"
              @click="saveBlock('footer', '备案信息')"
            >
              {{ savingKey === 'footer' ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.admin-home {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 60px;
}

.admin-toolbar {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  align-items: end;
  margin-bottom: var(--space-xl);
}

.admin-toolbar p {
  margin: 0 0 var(--space-xs);
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.admin-toolbar h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: clamp(2rem, 5vw, 3.1rem);
}

.admin-toolbar span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.admin-toolbar__actions {
  display: flex;
  gap: 0.75rem;
}

.admin-toolbar__actions button,
.editor-btn {
  position: relative;
  z-index: 4;
  border: 0;
  border-radius: 999px;
  padding: 0.32rem 0.62rem;
  font-size: 0.72rem;
  line-height: 1;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity var(--motion-base) ease,
    transform var(--motion-base) ease,
    background-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.ghost,
.editor-btn {
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-primary);
  box-shadow: 0 6px 14px rgba(10, 30, 48, 0.08);
}

.editor-btn--solid {
  background: rgba(247, 193, 70, 0.88);
  color: var(--color-primary-deep);
}

.editor-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(10, 30, 48, 0.12);
}

.editor-btn--file {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.editor-btn--file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.admin-loading,
.admin-message {
  display: grid;
  place-items: center;
  min-height: 4rem;
  margin-bottom: var(--space-lg);
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.76);
  color: var(--color-text-secondary);
}

.admin-nav {
  margin-bottom: var(--space-xl);
}

.admin-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 0.82rem 1rem;
  border: 1px solid var(--color-border-warm);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.26), transparent),
    var(--color-surface-float);
  backdrop-filter: blur(18px);
  box-shadow: 0 16px 40px rgba(10, 30, 48, 0.1);
}

.admin-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
}

.admin-nav__logo {
  display: inline-grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: radial-gradient(circle at top, rgba(247, 193, 70, 0.95), rgba(214, 142, 52, 1));
  color: var(--color-primary-deep);
  font-weight: 800;
}

.admin-nav__brand-copy {
  display: grid;
}

.admin-nav__brand-copy strong {
  color: var(--color-primary);
}

.admin-nav__brand-copy small {
  color: var(--color-text-secondary);
}

.admin-nav__actions,
.inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ghost-link,
.solid-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5.8rem;
  padding: 0.72rem 1.2rem;
  border-radius: 999px;
  font-weight: 700;
}

.ghost-link {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.46);
}

.solid-link {
  background: var(--color-accent);
  color: var(--color-primary-deep);
}

.admin-hero,
.admin-featured,
.admin-about,
.admin-footer {
  margin-top: var(--space-xl);
}

.admin-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
  gap: var(--space-2xl);
  padding: var(--space-4xl);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at 20% 18%, rgba(247, 193, 70, 0.22), transparent 24%),
    radial-gradient(circle at 78% 24%, rgba(58, 196, 255, 0.18), transparent 28%),
    linear-gradient(140deg, rgba(6, 18, 29, 0.96), rgba(16, 37, 59, 0.94));
  box-shadow: var(--shadow-hero);
}

.editable-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.eyebrow {
  color: var(--color-accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  color: var(--color-surface);
  font-size: clamp(3rem, 7vw, 5.2rem);
  line-height: 0.98;
}

.hero-description {
  color: var(--color-text-inverse-soft);
  font-size: var(--font-size-lg);
  line-height: 1.9;
}

.hero-note-card,
.hero-image-card,
.featured-card,
.about-mini-card {
  border-radius: var(--radius-2xl);
}

.hero-note-card,
.hero-image-card {
  position: relative;
  padding: var(--space-lg);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-surface);
}

.hero-note-card__badge {
  display: inline-flex;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgba(247, 193, 70, 0.14);
  color: var(--color-accent);
  font-size: var(--font-size-caption);
}

.hero-note-card h3 {
  margin: var(--space-sm) 0;
}

.hero-note-card p {
  color: var(--color-text-inverse-soft);
  line-height: 1.7;
}

.hero-images {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.hero-image-card img {
  width: 100%;
  aspect-ratio: 1 / 1.1;
  object-fit: cover;
  border-radius: 1rem;
  cursor: pointer;
}

.section-heading p {
  margin: 0;
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: var(--space-sm) 0 0;
  color: var(--color-text-strong);
}

.admin-featured {
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: var(--shadow-soft);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

.featured-card {
  padding: var(--space-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.featured-card__media {
  position: relative;
  margin-bottom: var(--space-md);
  border-radius: 1rem;
}

.featured-card__content {
  position: relative;
  cursor: pointer;
}

.featured-card__content > .inline-actions--text {
  opacity: 1;
  pointer-events: auto;
  transform: none;
  position: static;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.featured-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(6, 18, 29, 0);
  transition: background var(--motion-base) ease;
  pointer-events: none;
}

.featured-card__image {
  width: 100%;
  aspect-ratio: 1 / 0.82;
  object-fit: cover;
  border-radius: 1rem;
  display: block;
  cursor: pointer;
}

.editable-shell {
  position: relative;
}

.editable-shell--column {
  display: grid;
  gap: var(--space-xs);
}

.editable-shell:not(.editable-shell--active),
.editable-line:not(.editable-shell--active) {
  cursor: pointer;
}

.editable-shell,
.editable-line,
.hero-note-card,
.admin-footer__content {
  overflow: visible;
}

.inline-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1rem;
  padding: 0.55rem 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  font: inherit;
  line-height: inherit;
  outline: none;
  transition:
    border-color var(--motion-base) ease,
    background-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.inline-input:focus {
  border-color: rgba(247, 193, 70, 0.72);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(247, 193, 70, 0.12);
}

.admin-featured .inline-input,
.admin-about .inline-input,
.admin-footer .inline-input,
.admin-nav .inline-input {
  border-color: rgba(16, 42, 67, 0.12);
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-text-strong);
}

.admin-featured .inline-input:focus,
.admin-about .inline-input:focus,
.admin-footer .inline-input:focus,
.admin-nav .inline-input:focus {
  border-color: rgba(214, 142, 52, 0.6);
  background: #fffefb;
  box-shadow: 0 0 0 3px rgba(214, 142, 52, 0.12);
}

.inline-input--logo {
  width: 3.4rem;
  text-align: center;
  font-weight: 800;
}

.inline-input--sub,
.inline-input--hero-meta,
.inline-input--tag {
  font-size: var(--font-size-caption);
  letter-spacing: 0.08em;
}

.inline-input--button {
  min-width: 5.8rem;
  text-align: center;
  border-radius: 999px;
}

.inline-input--button-solid {
  background: rgba(247, 193, 70, 0.2);
}

.inline-input--hero-title,
.inline-input--about-title,
.inline-input--card-title {
  resize: none;
}

.inline-input--hero-description,
.inline-input--card-desc,
.inline-input--about-desc {
  resize: vertical;
}

.inline-input--badge {
  max-width: 12rem;
}

.inline-input--footer-link {
  min-width: min(28rem, 100%);
}

.inline-actions--text {
  position: absolute;
  top: 0.35rem;
  right: 0;
  z-index: 3;
  gap: 0.38rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-base) ease, transform var(--motion-base) ease;
  transform: translateY(-2px);
}

.editable-shell:hover .inline-actions--text,
.editable-shell--active .inline-actions--text,
.editable-shell:focus-within .inline-actions--text,
.inline-actions--text:hover,
.editable-line:hover .inline-actions--text,
.editable-line.editable-shell--active .inline-actions--text,
.editable-line:focus-within .inline-actions--text,
.hero-note-card:hover .inline-actions--text,
.hero-note-card.editable-shell--active .inline-actions--text,
.hero-note-card:focus-within .inline-actions--text,
.admin-footer__content:hover .inline-actions--text,
.admin-footer__content.editable-shell--active .inline-actions--text,
.admin-footer__content:focus-within .inline-actions--text {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.inline-actions--image {
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 2;
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.42rem;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.96);
  transition: opacity var(--motion-base) ease, transform var(--motion-base) ease;
}

.hero-image-card:hover .inline-actions--image,
.hero-image-card:focus-within .inline-actions--image,
.featured-card__media:hover .inline-actions--image,
.featured-card__media:focus-within .inline-actions--image {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}

.hero-image-card::after,
.featured-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(6, 18, 29, 0);
  transition: background var(--motion-base) ease;
  pointer-events: none;
}

.hero-image-card:hover::after,
.hero-image-card:focus-within::after,
.featured-card__media:hover::after,
.featured-card__media:focus-within::after {
  background: rgba(6, 18, 29, 0.26);
}

.inline-actions--image-card {
  top: calc((100% - var(--space-md) - 7.2rem) * 0.27);
}

.admin-nav__brand > .inline-actions--text,
.admin-nav__actions > .inline-actions--text,
.admin-about__copy > .inline-actions--text,
.admin-footer__content > .inline-actions--text {
  top: 0.25rem;
  right: 0;
}

.editable-line > .inline-actions--text {
  top: 0.25rem;
  right: 0;
}

.hero-note-card > .inline-actions--text,
.about-mini-card > .inline-actions--text {
  top: 0.55rem;
  right: 0.75rem;
}

.inline-actions--center {
  justify-content: center;
}

.featured-card span,
.admin-about__copy > p:first-child,
.about-mini-card span {
  color: var(--color-accent-deep);
  font-size: var(--font-size-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.featured-card h3,
.admin-about__copy h2 {
  margin: var(--space-sm) 0;
  color: var(--color-text-strong);
}

.featured-card p,
.admin-about__text {
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.admin-about {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
  gap: var(--space-xl);
  padding: var(--space-2xl);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at top right, rgba(58, 196, 255, 0.14), transparent 30%),
    rgba(255, 252, 247, 0.76);
  box-shadow: var(--shadow-soft);
}

.admin-about__cards {
  display: grid;
  gap: var(--space-md);
}

.about-mini-card {
  padding: var(--space-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.about-mini-card strong {
  display: block;
  margin-top: var(--space-xs);
  color: var(--color-primary-deep);
  line-height: 1.6;
}

.admin-footer {
  padding: var(--space-lg) 0 var(--space-lg);
}

.admin-footer__content {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--color-text-secondary);
}

.admin-footer__content a {
  color: var(--color-accent-deep);
}

.inline-actions--compact {
  gap: 0.38rem;
}

@media (max-width: 960px) {
  .admin-home {
    width: min(100% - 24px, 1180px);
  }

  .admin-hero,
  .admin-about,
  .featured-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .admin-home {
    width: min(100% - 20px, 1180px);
    padding-top: 20px;
  }

  .admin-toolbar {
    display: grid;
    align-items: start;
  }

  .admin-hero,
  .admin-featured,
  .admin-about {
    padding: var(--space-lg);
  }

  .editable-line {
    display: grid;
  }

  .hero-images {
    grid-template-columns: 1fr;
  }
}
</style>
