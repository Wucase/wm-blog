// 创作页文章状态定义，覆盖草稿、公开和私密三种常见场景。
export type ArticleEditorStatus = 'draft' | 'public' | 'private'

// 创作页编辑器类型，后续若接富文本可继续扩展。
export type ArticleEditorContentType = 'markdown' | 'richtext'

// 创作页草稿数据结构，前后端都可以围绕这套字段继续扩展。
export interface ArticleEditorDraft {
  id?: string
  title: string
  summary: string
  cover: string
  category: string
  tags: string[]
  content: string
  contentType: ArticleEditorContentType
  status: ArticleEditorStatus
  allowComment: boolean
  isRecommend: boolean
  isTop: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  publishTime: string
  lastSavedAt: string
}

// 我的文章列表使用简化结构，便于个人中心快速展示。
export interface UserArticleSummary {
  id: string
  title: string
  status: ArticleEditorStatus
  category: string
  updatedAt: string
  publishedAt: string
}
