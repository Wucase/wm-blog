import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { pinia } from '../stores/pinia'
import HomeView from '../views/HomeView.vue'
import CreateArticleView from '../views/CreateArticleView.vue'
import CreateArticlePreviewView from '../views/CreateArticlePreviewView.vue'
import AdminArticleManageView from '../views/AdminArticleManageView.vue'
import AdminArticleDetailView from '../views/AdminArticleDetailView.vue'
import AdminCommentManageView from '../views/AdminCommentManageView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminUserManageView from '../views/AdminUserManageView.vue'
import HoneViewSetting from '../views/HoneViewSetting.vue'
import LoginView from '../views/LoginView.vue'
import PublicBlogDetailView from '../views/PublicBlogDetailView.vue'
import PublicBlogView from '../views/PublicBlogView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import UserSettingsView from '../views/UserSettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/wm',
    },
    {
      path: '/wm',
      name: 'home',
      component: HomeView,
      meta: {
        role: 'guest',
      },
    },
    {
      path: '/wm/blog',
      name: 'publicBlog',
      component: PublicBlogView,
      meta: {
        role: 'guest',
      },
    },
    {
      path: '/wm/blog/:id',
      name: 'publicBlogDetail',
      component: PublicBlogDetailView,
      meta: {
        role: 'guest',
      },
    },
    {
      path: '/wm/login',
      name: 'login',
      component: LoginView,
      meta: {
        role: 'guest',
      },
    },
    {
      path: '/wm/register',
      name: 'register',
      component: RegisterView,
      meta: {
        role: 'guest',
      },
    },
    {
      path: '/wm/user/create',
      name: 'createArticle',
      component: CreateArticleView,
      meta: {
        role: 'user',
      },
    },
    {
      path: '/wm/user/create/preview',
      name: 'createArticlePreview',
      component: CreateArticlePreviewView,
      meta: {
        role: 'user',
      },
    },
    {
      path: '/wm/user/profile',
      name: 'userProfile',
      component: UserProfileView,
      meta: {
        role: 'user',
      },
    },
    {
      path: '/wm/user/settings',
      name: 'userSettings',
      component: UserSettingsView,
      meta: {
        role: 'user',
      },
    },
    {
      path: '/wm/admin/home-view-setting',
      name: 'honeViewSetting',
      component: HoneViewSetting,
      meta: {
        role: 'admin',
      },
    },
    {
      path: '/wm/admin/dashboard',
      name: 'adminDashboard',
      component: AdminDashboardView,
      meta: {
        role: 'admin',
      },
    },
    {
      path: '/wm/admin/articles',
      name: 'adminArticles',
      component: AdminArticleManageView,
      meta: {
        role: 'admin',
      },
    },
    {
      path: '/wm/admin/articles/:id',
      name: 'adminArticleDetail',
      component: AdminArticleDetailView,
      meta: {
        role: 'admin',
      },
    },
    {
      path: '/wm/admin/comments',
      name: 'adminComments',
      component: AdminCommentManageView,
      meta: {
        role: 'admin',
      },
    },
    {
      path: '/wm/admin/users',
      name: 'adminUsers',
      component: AdminUserManageView,
      meta: {
        role: 'admin',
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)
  await authStore.restoreSession()
  const requiredRole = to.meta.role as 'guest' | 'user' | 'admin' | undefined
  const redirectTarget = `${to.path}${typeof to.fullPath === 'string' && to.fullPath.includes('?') ? to.fullPath.slice(to.path.length) : ''}`

  if (requiredRole === 'admin') {
    if (!authStore.isLoggedIn) {
      return `/wm/login?redirect=${encodeURIComponent(redirectTarget)}`
    }

    if (authStore.user?.role !== 'admin') {
      return '/wm/blog'
    }
  }

  if (requiredRole === 'user' && !authStore.isLoggedIn) {
    return `/wm/login?redirect=${encodeURIComponent(redirectTarget)}`
  }

  return true
})

export default router
