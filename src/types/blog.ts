// 游客可见的公开博客页面数据结构，供展示页和后续接口共用。
export interface PublicBlogCategory {
  label: string
  count: string
}

export interface PublicBlogAuthor {
  name: string
  role: string
  avatarText: string
}

export interface PublicBlogFeaturedArticle {
  id: string
  title: string
  summary: string
  category: string
  readTime: string
  publishDate: string
  image: string
  author: PublicBlogAuthor
}

export interface PublicBlogArticle {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  readTime: string
  publishDate: string
  image: string
  author: PublicBlogAuthor
}

export interface PublicBlogArticleLink {
  id: string
  title: string
  summary: string
  category: string
  publishDate: string
  readTime: string
}

export interface PublicBlogArticleDetail extends PublicBlogArticle {
  content: string
  stats: {
    likes: number
    collects: number
    comments: number
    shares: number
  }
  previous?: PublicBlogArticleLink
  next?: PublicBlogArticleLink
  related?: PublicBlogArticle[]
}

export interface PublicComment {
  id: string
  authorId?: string
  authorName: string
  content: string
  publishTime: string
  parentId?: string
  replyToAuthor?: string
}

export interface PublicCommentPage {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  sort: 'latest' | 'oldest'
  list: PublicComment[]
}

export interface PublicBlogArticleActionState {
  liked: boolean
  collected: boolean
  likeCount: number
  collectCount: number
  commentCount: number
  shareCount: number
}

export interface PublicBlogPageData {
  eyebrow: string
  title: string
  description: string
  categories: PublicBlogCategory[]
  featured: PublicBlogFeaturedArticle
  articles: PublicBlogArticle[]
}

export interface PublicBlogArticlePage {
  list: PublicBlogArticle[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
