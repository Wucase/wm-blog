import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const siteName = ref('WM Blog')
  const description = ref('记录前端设计、工程化思考、组件细节与持续创作的个人博客空间。')
  const headerTitle = computed(() => `${siteName.value} · 前端博客`)

  return {
    siteName,
    description,
    headerTitle,
  }
})
