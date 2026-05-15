export interface AdminUserSummary {
  id: string
  name: string
  phone: string
  avatarText: string
  role: 'user' | 'admin'
  createdAt: string
}
