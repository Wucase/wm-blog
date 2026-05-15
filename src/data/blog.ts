import coverExplore from '../assets/wm-cover-explore.svg'
import coverStudio from '../assets/wm-cover-studio.svg'
import coverSystems from '../assets/wm-cover-systems.svg'
import type { PublicBlogArticlePage, PublicBlogPageData } from '../types/blog'

// 游客博客页的 mock 数据集中放在这里，后续接接口时可以直接替换。
export const publicBlogPageMockData: PublicBlogPageData = {
  eyebrow: 'Public Blog Feed',
  title: '公开博客文章',
  description:
    '面向游客开放的文章列表页，展示用户已公开发布的博客内容。这里会优先呈现近期更新、精选文章与持续公开的专题写作。',
  categories: [
    {
      label: '全部文章',
      count: '24',
    },
    {
      label: 'Vue 3',
      count: '08',
    },
    {
      label: '工程化',
      count: '06',
    },
    {
      label: '设计系统',
      count: '05',
    },
  ],
  featured: {
    id: 'public-article-001',
    title: '把博客首页做成“可读空间”，而不是静态卡片墙',
    summary:
      '公开博客展示页的重点不是堆信息，而是建立阅读节奏。导航、导读、精选文章和文章流要形成清晰层级，游客才能自然继续向下浏览。',
    category: 'Editorial Design',
    readTime: '8 min read',
    publishDate: '2026.03.24',
    image: coverExplore,
    author: {
      name: 'WM',
      role: 'Frontend Writer',
      avatarText: 'WM',
    },
  },
  articles: [
    {
      id: 'public-article-001',
      title: '为什么游客文章列表页不能只做三列卡片堆叠',
      summary:
        '公开文章页不仅要展示内容，还要引导浏览。通过精选位、信息密度分层和阅读辅助信息，页面才能真正承担站点入口的作用。',
      category: 'Content Strategy',
      tags: ['游客页', '信息层级', '博客设计'],
      readTime: '6 min read',
      publishDate: '2026.03.22',
      image: coverStudio,
      author: {
        name: '安南',
        role: 'UI Engineer',
        avatarText: 'AN',
      },
    },
    {
      id: 'public-article-002',
      title: '从 Vue 页面结构出发，搭一套可维护的博客前端模块',
      summary:
        '把游客首页、文章展示页、设置页和服务层拆清楚，后续接权限、接后端和继续扩模块都会更顺手。',
      category: 'Engineering',
      tags: ['Vue 3', '模块化', '架构'],
      readTime: '10 min read',
      publishDate: '2026.03.20',
      image: coverSystems,
      author: {
        name: '林一',
        role: 'Frontend Developer',
        avatarText: 'LY',
      },
    },
    {
      id: 'public-article-003',
      title: '用设计变量统一博客文章卡片的色彩、阴影和间距',
      summary:
        '当博客既有首页欢迎区，又有公开文章页和后台编辑页时，CSS 变量会成为整个界面的稳定底座。',
      category: 'Design Token',
      tags: ['CSS Variables', '主题', '组件视觉'],
      readTime: '7 min read',
      publishDate: '2026.03.18',
      image: coverExplore,
      author: {
        name: '栗子',
        role: 'Visual Coder',
        avatarText: 'LZ',
      },
    },
    {
      id: 'public-article-004',
      title: '公开博客的作者信息应该怎么展示，才能既克制又可信',
      summary:
        '作者名、角色、发布时间、阅读时长和标签这些元信息，不应该喧宾夺主，但必须足够清晰，才能支撑游客的浏览判断。',
      category: 'Reading Experience',
      tags: ['作者信息', '阅读体验', '公开文章'],
      readTime: '5 min read',
      publishDate: '2026.03.15',
      image: coverStudio,
      author: {
        name: '阿折',
        role: 'Product Designer',
        avatarText: 'AZ',
      },
    },
    {
      id: 'public-article-005',
      title: '博客公开文章页里的精选卡片，应该承担什么职责',
      summary:
        '精选卡片不是装饰物，它应该承担导读、定调和承接首屏情绪的作用，让游客快速抓住站点的内容方向。',
      category: 'Page Design',
      tags: ['精选位', '内容导读', '视觉节奏'],
      readTime: '9 min read',
      publishDate: '2026.03.12',
      image: coverSystems,
      author: {
        name: '青时',
        role: 'Frontend Designer',
        avatarText: 'QS',
      },
    },
    {
      id: 'public-article-006',
      title: '当游客第一次进入技术博客，他真正会先看什么',
      summary:
        '并不是标题，也不是按钮，而是页面整体是否有秩序。布局、留白、节奏和可信度，会先于文字内容影响停留时间。',
      category: 'Visual Writing',
      tags: ['首屏', '博客体验', '内容展示'],
      readTime: '6 min read',
      publishDate: '2026.03.09',
      image: coverExplore,
      author: {
        name: '墨维',
        role: 'Frontend Creator',
        avatarText: 'MW',
      },
    },
    {
      id: 'public-article-007',
      title: '前端博客里的公开文章页，为什么要把搜索放在导航里',
      summary:
        '当游客已经进入文章流场景时，搜索不应该被埋进页面深处。导航中的搜索入口更符合“随时切换阅读目标”的预期。',
      category: 'Search Experience',
      tags: ['搜索', '导航', '游客体验'],
      readTime: '7 min read',
      publishDate: '2026.03.07',
      image: coverSystems,
      author: {
        name: '周河',
        role: 'Frontend Engineer',
        avatarText: 'ZH',
      },
    },
    {
      id: 'public-article-008',
      title: '怎么让公开文章卡片既有信息量，又不会压得读者喘不过气',
      summary:
        '卡片不是把所有字段都塞进去，而是要找到游客最先需要的那几项：标题、摘要、作者、发布时间和阅读时长。',
      category: 'Content UI',
      tags: ['文章卡片', '信息密度', '阅读'],
      readTime: '6 min read',
      publishDate: '2026.03.05',
      image: coverStudio,
      author: {
        name: '秋野',
        role: 'UI Developer',
        avatarText: 'QY',
      },
    },
    {
      id: 'public-article-009',
      title: '技术博客公开页里的分类，不只是筛选条件',
      summary:
        '分类的作用不仅是过滤文章，更是帮助游客快速理解这个博客主要写什么，从而决定要不要继续浏览。',
      category: 'Information Architecture',
      tags: ['分类', '信息架构', '游客'],
      readTime: '8 min read',
      publishDate: '2026.03.03',
      image: coverExplore,
      author: {
        name: '木川',
        role: 'Product Engineer',
        avatarText: 'MC',
      },
    },
    {
      id: 'public-article-010',
      title: '从文章摘要的长度开始，控制博客列表页的节奏感',
      summary:
        '摘要写得过长会让页面变重，过短又无法判断内容价值。公开列表页需要的是稳定而可扫描的阅读节奏。',
      category: 'Editorial UX',
      tags: ['摘要', '节奏', '列表页'],
      readTime: '5 min read',
      publishDate: '2026.03.01',
      image: coverSystems,
      author: {
        name: '姜序',
        role: 'Content Designer',
        avatarText: 'JX',
      },
    },
    {
      id: 'public-article-011',
      title: '为什么公开文章页也需要为登录用户预留创作入口',
      summary:
        '游客在阅读，登录用户却可能在切换浏览与创作。公开文章页并不意味着只能服务游客，也要兼顾已登录用户的动作路径。',
      category: 'Product Flow',
      tags: ['登录态', '创作入口', '博客产品'],
      readTime: '9 min read',
      publishDate: '2026.02.28',
      image: coverStudio,
      author: {
        name: '莫蓝',
        role: 'Frontend Product',
        avatarText: 'ML',
      },
    },
    {
      id: 'public-article-012',
      title: '把“没有更多了”做得体面，也是博客列表体验的一部分',
      summary:
        '列表终点不应该是一个突兀的结束，而应该给用户一个明确、平静、可感知的反馈，告诉他已经读到最后。',
      category: 'Interaction Detail',
      tags: ['加载更多', '终态', '交互细节'],
      readTime: '4 min read',
      publishDate: '2026.02.26',
      image: coverExplore,
      author: {
        name: '知遥',
        role: 'Interaction Designer',
        avatarText: 'ZY',
      },
    },
  ],
}

// 模拟公开博客页接口异步返回，后续切换真实接口时页面层无需改动。
export function getPublicBlogPageDataMock(): Promise<PublicBlogPageData> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(publicBlogPageMockData)
    }, 160)
  })
}

// 模拟分页读取公开文章列表，便于后续平滑切换真实分页接口。
export function getPublicBlogArticlesPageMock(
  page = 1,
  pageSize = 10,
  keyword = '',
  category = '',
): Promise<PublicBlogArticlePage> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const normalizedKeyword = keyword.trim().toLowerCase()
      const normalizedCategory = category.trim()

      const filteredArticles = publicBlogPageMockData.articles.filter((article) => {
        const matchesCategory = !normalizedCategory || article.category === normalizedCategory

        const matchesKeyword =
          !normalizedKeyword ||
          article.title.toLowerCase().includes(normalizedKeyword) ||
          article.summary.toLowerCase().includes(normalizedKeyword) ||
          article.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword)) ||
          article.author.name.toLowerCase().includes(normalizedKeyword)

        return matchesCategory && matchesKeyword
      })

      const total = filteredArticles.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const list = filteredArticles.slice(startIndex, endIndex)

      resolve({
        list,
        page,
        pageSize,
        total,
        hasMore: endIndex < total,
      })
    }, 180)
  })
}

// 对公开博客页数据做一次标准化，避免后端字段缺失时页面直接报错。
export function normalizePublicBlogPageData(
  data: Partial<PublicBlogPageData>,
): PublicBlogPageData {
  return {
    eyebrow: data.eyebrow ?? publicBlogPageMockData.eyebrow,
    title: data.title ?? publicBlogPageMockData.title,
    description: data.description ?? publicBlogPageMockData.description,
    categories: data.categories ?? publicBlogPageMockData.categories,
    featured: {
      ...publicBlogPageMockData.featured,
      ...data.featured,
      author: {
        ...publicBlogPageMockData.featured.author,
        ...data.featured?.author,
      },
    },
    articles: data.articles ?? publicBlogPageMockData.articles,
  }
}
