import { appConfig } from '../config/app'
import { del, http } from '../utils/http'
import type { ArticleEditorDraft, UserArticleSummary } from '../types/articleEditor'
import type { AdminArticleSummary } from '../types/adminArticle'
import type { AdminCommentSummary } from '../types/adminComment'

const ARTICLE_EDITOR_DRAFT_KEY = 'wm-blog:article-editor-draft'
const ARTICLE_EDITOR_PREVIEW_KEY = 'wm-blog:article-editor-preview'

// 默认草稿为创作页提供稳定的初始结构，避免页面层到处做空值判断。
export const defaultArticleEditorDraft: ArticleEditorDraft = {
  title: '',
  summary: '',
  cover: '',
  category: 'frontend',
  tags: [],
  content: '',
  contentType: 'markdown',
  status: 'draft',
  allowComment: true,
  isRecommend: false,
  isTop: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [],
  publishTime: '',
  lastSavedAt: '',
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function persistLocalSnapshot(storageKey: string, draft: ArticleEditorDraft) {
  const nextDraft = {
    ...draft,
    lastSavedAt: new Date().toISOString(),
  }

  if (canUseLocalStorage()) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextDraft))
  }

  return nextDraft
}

// 读取本地草稿，方便创作页刷新后继续编辑。
export function readArticleEditorDraft() {
  if (!canUseLocalStorage()) {
    return structuredClone(defaultArticleEditorDraft)
  }

  const rawValue = window.localStorage.getItem(ARTICLE_EDITOR_DRAFT_KEY)
  if (!rawValue) {
    return structuredClone(defaultArticleEditorDraft)
  }

  try {
    return {
      ...structuredClone(defaultArticleEditorDraft),
      ...JSON.parse(rawValue),
    } as ArticleEditorDraft
  } catch {
    return structuredClone(defaultArticleEditorDraft)
  }
}

interface ArticleEditorApiResponse {
  data: ArticleEditorDraft
}

function mapArticleEditorResponse(responseData: ArticleEditorApiResponse | ArticleEditorDraft) {
  return 'data' in responseData ? responseData.data : responseData
}

function buildArticleEditorPayload(draft: ArticleEditorDraft) {
  return {
    ...draft,
  }
}

function persistDraftToLocal(draft: ArticleEditorDraft) {
  return persistLocalSnapshot(ARTICLE_EDITOR_DRAFT_KEY, draft)
}

// 保存草稿，开发期可以继续走本地，切到后端后结构保持不变。
export async function saveArticleEditorDraft(draft: ArticleEditorDraft) {
  if (appConfig.useMock) {
    return persistDraftToLocal(draft)
  }

  const response = await http.post<ArticleEditorApiResponse | ArticleEditorDraft>(
    '/user/articles/draft',
    buildArticleEditorPayload(draft),
  )

  return mapArticleEditorResponse(response.data)
}

// 发布文章和保存草稿分离，便于后端做不同的业务校验。
export async function publishArticleDraft(draft: ArticleEditorDraft) {
  if (appConfig.useMock) {
    return persistDraftToLocal({
      ...draft,
      status: 'public',
    })
  }

  const response = await http.post<ArticleEditorApiResponse | ArticleEditorDraft>(
    '/user/articles/publish',
    buildArticleEditorPayload(draft),
  )

  return mapArticleEditorResponse(response.data)
}

// 获取当前用户的文章列表，供个人中心和创作页侧边栏复用。
export async function getUserArticles() {
  if (appConfig.useMock) {
    const localDraft = readArticleEditorDraft()
    if (!localDraft.title.trim()) {
      return [] as UserArticleSummary[]
    }

    return [
      {
        id: localDraft.id || 'local-draft',
        title: localDraft.title,
        status: localDraft.status,
        category: localDraft.category,
        updatedAt: localDraft.lastSavedAt ? localDraft.lastSavedAt.replace('T', ' ').slice(0, 16) : '刚刚',
        publishedAt: localDraft.publishTime ? localDraft.publishTime.replace('T', ' ') : '',
      },
    ]
  }

  const response = await http.get<{ data: UserArticleSummary[] } | UserArticleSummary[]>(
    '/user/articles',
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getUserArticleDetail(articleId: string) {
  if (appConfig.useMock) {
    return readArticleEditorDraft()
  }

  const response = await http.get<{ data: ArticleEditorDraft } | ArticleEditorDraft>(
    `/user/articles/${articleId}`,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getAdminArticles(keyword = '', status = 'all') {
  if (appConfig.useMock) {
    return [] as AdminArticleSummary[]
  }

  const response = await http.get<{ data: AdminArticleSummary[] } | AdminArticleSummary[]>(
    '/admin/articles',
    {
      params: {
        keyword,
        status,
      },
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function updateAdminArticleStatus(articleId: string, status: string) {
  if (appConfig.useMock) {
    return {
      id: articleId,
      title: 'Mock 文章',
      status,
      category: 'frontend',
      authorId: '0',
      authorName: 'WM',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      publishedAt: status === 'public' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : '',
    }
  }

  const response = await http.patch<{ data: AdminArticleSummary } | AdminArticleSummary>(
    `/admin/articles/${articleId}/status`,
    {
      status,
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getAdminArticleDetail(articleId: string) {
  if (appConfig.useMock) {
    return readArticleEditorDraft()
  }

  const response = await http.get<{ data: ArticleEditorDraft } | ArticleEditorDraft>(
    `/admin/articles/${articleId}`,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function deleteAdminArticle(articleId: string) {
  if (appConfig.useMock) {
    return { deleted: true }
  }

  const response = await del<{ data: { deleted: boolean } } | { deleted: boolean }>(
    `/admin/articles/${articleId}`,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getAdminComments(keyword = '', articleId = '') {
  if (appConfig.useMock) {
    return [] as AdminCommentSummary[]
  }

  const response = await http.get<{ data: AdminCommentSummary[] } | AdminCommentSummary[]>(
    '/admin/comments',
    {
      params: {
        keyword,
        articleId,
      },
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function deleteAdminComment(commentId: string) {
  if (appConfig.useMock) {
    return { deleted: true }
  }

  const response = await del<{ data: { deleted: boolean } } | { deleted: boolean }>(
    `/admin/comments/${commentId}`,
  )

  return 'data' in response.data ? response.data.data : response.data
}

// 清理草稿，便于发布成功后或用户主动重置时恢复初始状态。
export function clearArticleEditorDraft() {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ARTICLE_EDITOR_DRAFT_KEY)
  }
}

// 预览页使用单独快照，避免仅靠后端暂存导致预览和当前编辑内容不同步。
export function cacheArticlePreviewDraft(draft: ArticleEditorDraft) {
  return persistLocalSnapshot(ARTICLE_EDITOR_PREVIEW_KEY, draft)
}

export function readArticlePreviewDraft() {
  if (!canUseLocalStorage()) {
    return null
  }

  const rawValue = window.localStorage.getItem(ARTICLE_EDITOR_PREVIEW_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return {
      ...structuredClone(defaultArticleEditorDraft),
      ...JSON.parse(rawValue),
    } as ArticleEditorDraft
  } catch {
    return null
  }
}
