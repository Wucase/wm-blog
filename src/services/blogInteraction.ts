import { appConfig } from '../config/app'
import type { PublicBlogArticleActionState } from '../types/blog'
import { http } from '../utils/http'

const PUBLIC_BLOG_ACTIONS_KEY = 'wm-blog:public-blog-article-actions'

interface PublicBlogArticleActionResponse {
  data: PublicBlogArticleActionState
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getStoredActionMap() {
  if (!canUseStorage()) {
    return {} as Record<string, PublicBlogArticleActionState>
  }

  const rawValue = window.localStorage.getItem(PUBLIC_BLOG_ACTIONS_KEY)

  if (!rawValue) {
    return {} as Record<string, PublicBlogArticleActionState>
  }

  try {
    return JSON.parse(rawValue) as Record<string, PublicBlogArticleActionState>
  } catch {
    return {} as Record<string, PublicBlogArticleActionState>
  }
}

function saveStoredActionMap(actionMap: Record<string, PublicBlogArticleActionState>) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(PUBLIC_BLOG_ACTIONS_KEY, JSON.stringify(actionMap))
}

function mapActionResponse(
  responseData: PublicBlogArticleActionResponse | PublicBlogArticleActionState,
) {
  const actionData = 'data' in responseData ? responseData.data : responseData

  return {
    liked: actionData.liked ?? false,
    collected: actionData.collected ?? false,
    likeCount: actionData.likeCount ?? 0,
    collectCount: actionData.collectCount ?? 0,
    commentCount: actionData.commentCount ?? 0,
    shareCount: actionData.shareCount ?? 0,
  }
}

function getDefaultActionState(index: number): PublicBlogArticleActionState {
  return {
    liked: false,
    collected: false,
    likeCount: 18 + index * 3,
    collectCount: 6 + index,
    commentCount: 3 + (index % 5),
    shareCount: 2 + (index % 4),
  }
}

export async function getPublicBlogArticleActionState(articleId: string, index: number) {
  if (appConfig.useMock) {
    const actionMap = getStoredActionMap()

    if (!actionMap[articleId]) {
      actionMap[articleId] = getDefaultActionState(index)
      saveStoredActionMap(actionMap)
    }

    return actionMap[articleId]
  }

  const response = await http.get<PublicBlogArticleActionResponse | PublicBlogArticleActionState>(
    `/blog/public/articles/${articleId}/actions`,
  )

  return mapActionResponse(response.data)
}

export async function togglePublicBlogArticleLike(articleId: string) {
  if (appConfig.useMock) {
    const actionMap = getStoredActionMap()
    const currentState = actionMap[articleId]

    if (!currentState) {
      return getDefaultActionState(0)
    }

    const nextState = {
      ...currentState,
      liked: !currentState.liked,
      likeCount: currentState.likeCount + (currentState.liked ? -1 : 1),
    }

    actionMap[articleId] = nextState
    saveStoredActionMap(actionMap)
    return nextState
  }

  const response = await http.post<PublicBlogArticleActionResponse | PublicBlogArticleActionState>(
    `/blog/public/articles/${articleId}/like`,
  )

  return mapActionResponse(response.data)
}

export async function togglePublicBlogArticleCollect(articleId: string) {
  if (appConfig.useMock) {
    const actionMap = getStoredActionMap()
    const currentState = actionMap[articleId]

    if (!currentState) {
      return getDefaultActionState(0)
    }

    const nextState = {
      ...currentState,
      collected: !currentState.collected,
      collectCount: currentState.collectCount + (currentState.collected ? -1 : 1),
    }

    actionMap[articleId] = nextState
    saveStoredActionMap(actionMap)
    return nextState
  }

  const response = await http.post<PublicBlogArticleActionResponse | PublicBlogArticleActionState>(
    `/blog/public/articles/${articleId}/collect`,
  )

  return mapActionResponse(response.data)
}

export async function removePublicBlogArticleCollect(articleId: string) {
  const nextState = await togglePublicBlogArticleCollect(articleId)
  if (nextState.collected) {
    return await togglePublicBlogArticleCollect(articleId)
  }

  return nextState
}

export async function increasePublicBlogArticleShare(articleId: string) {
  if (appConfig.useMock) {
    const actionMap = getStoredActionMap()
    const currentState = actionMap[articleId]

    if (!currentState) {
      return getDefaultActionState(0)
    }

    const nextState = {
      ...currentState,
      shareCount: currentState.shareCount + 1,
    }

    actionMap[articleId] = nextState
    saveStoredActionMap(actionMap)
    return nextState
  }

  const response = await http.post<PublicBlogArticleActionResponse | PublicBlogArticleActionState>(
    `/blog/public/articles/${articleId}/share`,
  )

  return mapActionResponse(response.data)
}
