export interface AdminCommentSummary {
  id: string
  articleId: string
  articleTitle: string
  authorId?: string
  authorName: string
  content: string
  replyToAuthor?: string
  createdAt: string
}
