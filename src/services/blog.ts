import { appConfig } from '../config/app'
import {
  getPublicBlogArticlesPageMock,
  getPublicBlogPageDataMock,
  normalizePublicBlogPageData,
} from '../data/blog'
import type {
  PublicBlogArticle,
  PublicBlogArticleDetail,
  PublicBlogArticleLink,
  PublicBlogArticlePage,
  PublicComment,
  PublicCommentPage,
  PublicBlogPageData,
} from '../types/blog'
import { http } from '../utils/http'

interface PublicBlogPageResponse {
  data: PublicBlogPageData
}

interface PublicBlogArticlePageResponse {
  data: PublicBlogArticlePage
}

interface PublicBlogArticleDetailResponse {
  data: PublicBlogArticleDetail
}

interface PublicCommentResponse {
  data: PublicCommentPage
}

interface PublicCommentItemResponse {
  data: PublicComment
}

function mapBackendArticle(article: Record<string, any>, fallbackIndex = 0): PublicBlogArticle {
  return {
    id: String(article.id ?? `public-article-${fallbackIndex}`),
    title: article.title ?? '',
    summary: article.summary ?? '',
    category: article.category ?? '未分类',
    tags: article.tags ?? [],
    readTime: article.readTime ?? '6 min read',
    publishDate: article.publishedAt ?? '',
    image: article.cover ?? '',
    author: {
      name: article.author?.name ?? 'WM',
      role: article.author?.role ?? 'Author',
      avatarText: article.author?.avatarText ?? 'WM',
    },
  }
}

function mapBackendArticleLink(article: Record<string, any> | undefined): PublicBlogArticleLink | undefined {
  if (!article) {
    return undefined
  }

  return {
    id: String(article.id ?? ''),
    title: article.title ?? '',
    summary: article.summary ?? '',
    category: article.category ?? '未分类',
    publishDate: article.publishedAt ?? '',
    readTime: article.readTime ?? '6 min read',
  }
}

// 公开博客页服务层，统一处理 mock / 后端切换逻辑。
export async function getPublicBlogPageData(): Promise<PublicBlogPageData> {
  if (appConfig.useMock) {
    const mockData = await getPublicBlogPageDataMock()
    const firstPage = await getPublicBlogArticlesPageMock(1)

    return {
      ...mockData,
      articles: firstPage.list,
    }
  }

  const response = await http.get<PublicBlogPageResponse | PublicBlogPageData>('/blog/public')
  return mapPublicBlogPageResponse(response.data)
}

// 公开博客文章列表分页读取。
export async function getPublicBlogArticlesPage(
  page = 1,
  pageSize = 10,
  keyword = '',
  category = '',
): Promise<PublicBlogArticlePage> {
  if (appConfig.useMock) {
    return getPublicBlogArticlesPageMock(page, pageSize, keyword, category)
  }

  const response = await http.get<PublicBlogArticlePageResponse | PublicBlogArticlePage>(
    '/blog/public/articles',
    {
      params: {
        page,
        pageSize,
        keyword,
        category,
      },
    },
  )

  return mapPublicBlogArticlesPageResponse(response.data)
}

// 后续如果后端字段名和前端结构不一致，可以在这里集中做映射。
export function mapPublicBlogPageResponse(
  responseData: PublicBlogPageResponse | PublicBlogPageData,
) {
  const pageData = 'data' in responseData ? responseData.data : responseData

  if ('hero' in pageData || 'featured' in pageData) {
    const backendPageData = pageData as Record<string, any>
    const featuredArticle = Array.isArray(backendPageData.featured)
      ? backendPageData.featured[0]
      : backendPageData.featured

    return normalizePublicBlogPageData({
      eyebrow: 'Public Blog Feed',
      title: backendPageData.hero?.title ?? backendPageData.title,
      description: backendPageData.hero?.description ?? backendPageData.description,
      categories: backendPageData.categories?.map((item: Record<string, any>) => ({
        label: item.label ?? item.value ?? '全部文章',
        count: item.count ?? '00',
      })),
      featured: featuredArticle
        ? {
            ...mapBackendArticle(featuredArticle),
          }
        : undefined,
      articles: Array.isArray(backendPageData.articles)
        ? backendPageData.articles.map((item: Record<string, any>, index: number) => mapBackendArticle(item, index))
        : undefined,
    })
  }

  return normalizePublicBlogPageData(pageData)
}

export function mapPublicBlogArticlesPageResponse(
  responseData: PublicBlogArticlePageResponse | PublicBlogArticlePage,
) {
  const pageData = 'data' in responseData ? responseData.data : responseData

  return {
    list: (pageData.list ?? []).map((item: Record<string, any>, index: number) => mapBackendArticle(item, index)),
    page: pageData.page ?? 1,
    pageSize: pageData.pageSize ?? 10,
    total: pageData.total ?? 0,
    hasMore: pageData.hasMore ?? false,
  }
}

export async function getPublicBlogArticleDetail(articleId: string): Promise<PublicBlogArticleDetail> {
  if (appConfig.useMock) {
    const pageData = await getPublicBlogPageDataMock()
    const article = pageData.articles.find((item) => item.id === articleId)

    if (!article) {
      throw new Error('文章不存在')
    }

    return {
      ...article,
      content:
        '这是一篇用于详情页展示的 mock 正文内容。后续切到真实后端后，这里会直接展示数据库中的文章正文、统计信息和更多元数据。',
      stats: {
        likes: 32,
        collects: 14,
        comments: 6,
        shares: 5,
      },
      previous: pageData.articles[1]
        ? {
            id: pageData.articles[1].id,
            title: pageData.articles[1].title,
            summary: pageData.articles[1].summary,
            category: pageData.articles[1].category,
            publishDate: pageData.articles[1].publishDate,
            readTime: pageData.articles[1].readTime,
          }
        : undefined,
      related: pageData.articles.filter((item) => item.id !== articleId).slice(0, 3),
    }
  }

  const response = await http.get<PublicBlogArticleDetailResponse | PublicBlogArticleDetail>(
    `/blog/public/articles/${articleId}`,
  )

  const detailData = 'data' in response.data ? response.data.data : response.data

  return {
    ...mapBackendArticle(detailData as Record<string, any>),
    content: detailData.content ?? '',
    stats: detailData.stats ?? {
      likes: 0,
      collects: 0,
      comments: 0,
      shares: 0,
    },
    previous: mapBackendArticleLink(detailData.previous),
    next: mapBackendArticleLink(detailData.next),
    related: Array.isArray(detailData.related)
      ? detailData.related.map((item: Record<string, any>, index: number) => mapBackendArticle(item, index))
      : [],
  }
}

export async function getPublicArticleComments(
  articleId: string,
  page = 1,
  pageSize = 10,
  sort: 'latest' | 'oldest' = 'latest',
) {
  if (appConfig.useMock) {
    const mockList = [
      {
        id: 'comment-001',
        authorName: '木川',
        content: '这篇文章的结构很清楚，尤其是列表页和详情页之间的承接思路。',
        publishTime: '2026-03-24 20:12',
      },
      {
        id: 'comment-002',
        authorName: '青时',
        content: '文章详情页如果后续再加目录锚点，会更适合长文阅读。',
        publishTime: '2026-03-24 20:46',
      },
    ] as PublicComment[]

    const sortedList = sort === 'oldest' ? [...mockList].reverse() : mockList

    return {
      page,
      pageSize,
      total: sortedList.length,
      hasMore: false,
      sort,
      list: sortedList.slice((page - 1) * pageSize, page * pageSize),
    } as PublicCommentPage
  }

  const response = await http.get<PublicCommentResponse | PublicCommentPage>(
    `/blog/public/articles/${articleId}/comments`,
    {
      params: {
        page,
        pageSize,
        sort,
      },
    },
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function createPublicArticleComment(articleId: string, payload: { authorId?: string; authorName: string; content: string; parentId?: string }) {
  if (appConfig.useMock) {
    return {
      id: `comment-${Date.now()}`,
      authorId: 'mock-user',
      authorName: payload.authorName || '游客',
      content: payload.content,
      publishTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      parentId: payload.parentId,
    } as PublicComment
  }

  const response = await http.post<PublicCommentItemResponse | PublicComment>(
    `/blog/public/articles/${articleId}/comments`,
    payload,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function deletePublicArticleComment(
  articleId: string,
  commentId: string,
) {
  if (appConfig.useMock) {
    return { deleted: true }
  }

  const response = await http.delete<{ data: { deleted: boolean } } | { deleted: boolean }>(
    `/blog/public/articles/${articleId}/comments/${commentId}`,
  )

  return 'data' in response.data ? response.data.data : response.data
}

export async function getUserCollectedArticles() {
  if (appConfig.useMock) {
    return [] as PublicBlogArticle[]
  }

  const response = await http.get<{ data: PublicBlogArticle[] } | PublicBlogArticle[]>(
    '/user/collections',
  )

  const articleList = 'data' in response.data ? response.data.data : response.data
  return articleList.map((item: Record<string, any>, index: number) => mapBackendArticle(item, index))
}
