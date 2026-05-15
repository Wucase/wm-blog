import type { HomePageData } from '../types/home'
import coverExplore from '../assets/wm-cover-explore.svg'
import coverSystems from '../assets/wm-cover-systems.svg'
import coverStudio from '../assets/wm-cover-studio.svg'

// 首页展示数据集中管理，后续接接口时可以在这里平滑替换。
export const homeNav: HomePageData['nav'] = {
  brand: {
    logoText: 'WM',
    name: 'WM Blog',
    subTitle: 'Frontend Notes',
    href: '/wm',
  },
  actions: [
    {
      label: '登录',
      href: '/wm/login',
      variant: 'ghost',
    },
    {
      label: '注册',
      href: '/wm/register',
      variant: 'solid',
    },
  ],
}

export const homeHero: HomePageData['hero'] = {
  eyebrow: 'WM Blog / Frontend Journal',
  title: 'WM Blog · 前端博客',
  description: '记录前端设计、工程化思考、组件细节与持续创作的个人博客空间。',
  actions: [
    {
      label: '进入博客',
      href: '/wm/blog',
      variant: 'primary',
    },
    {
      label: '了解站点',
      href: '/wm#about',
      variant: 'secondary',
    },
  ],
  stage: {
    badge: 'Welcome',
    title: '把博客做成一个有节奏感的数字空间',
    description: '内容不只是罗列文章，而是让访问者愿意继续向下探索。',
    leftCardImage: coverExplore,
    leftCardAlt: '博客探索主题封面',
    rightCardImage: coverSystems,
    rightCardAlt: '工程化主题封面',
    noteLabel: 'Latest motion',
    noteValue: 'Pure CSS + Vue',
  },
}

export const featuredPosts: HomePageData['featuredPosts'] = [
  {
    title: 'Vue 3 博客首页如何做沉浸式欢迎页',
    tag: 'Vue',
    summary: '从信息层级、情绪基调到动画节奏，首屏不是堆素材，而是先建立访问者的第一印象。',
    image: coverExplore,
  },
  {
    title: '前端工程化里真正值得长期维护的目录结构',
    tag: 'Engineering',
    summary: '页面、组件、状态、请求、工具函数要按职责拆开，不要等项目变大之后再救火。',
    image: coverSystems,
  },
  {
    title: '为博客设计一套可扩展的视觉变量系统',
    tag: 'Design Token',
    summary: '把主题色、字号、阴影、圆角与间距收敛成变量，后续改版和深色模式都会轻松很多。',
    image: coverStudio,
  },
]

export const highlightMetrics: HomePageData['highlightMetrics'] = [
  {
    value: '12+',
    label: '主题模块',
    description: '围绕组件设计、工程化、性能和个人输出逐步扩展。',
  },
  {
    value: '48h',
    label: '近期更新节奏',
    description: '保持短周期迭代，让首页和内容持续有新鲜感。',
  },
  {
    value: '∞',
    label: '长期维护',
    description: '从一开始就考虑目录、样式和状态管理的可持续性。',
  },
]

export const entrySections: HomePageData['entrySections'] = [
  {
    index: '01',
    title: '前端文章',
    description: '记录 Vue、TypeScript、组件设计、性能优化和业务交付中的真实经验。',
  },
  {
    index: '02',
    title: '项目拆解',
    description: '用模块拆分、请求设计和状态流转来分析中后台、博客和内容系统项目。',
  },
  {
    index: '03',
    title: '个人实验',
    description: '保留一些视觉探索、动画试验和前端工程实践，让博客不只是静态文章列表。',
  },
]

export const homeAbout: HomePageData['about'] = {
  eyebrow: 'About The Blog',
  title: 'WM Blog',
  description:
    '这里会持续沉淀前端开发中的真实经验：Vue 组件设计、TypeScript 约束、接口封装、页面动效、工程化组织，以及从想法落到可维护代码的全过程。',
  cards: [
    {
      label: 'Stack',
      value: 'Vue 3 + TypeScript + Pinia + Axios + Router',
    },
    {
      label: 'Direction',
      value: '写有设计感的前端，也写能长期维护的代码',
    },
  ],
}

export const homeFooter: HomePageData['footer'] = {
  copyright: '© 2026 WM Blog. All rights reserved.',
  beian: {
    label: '粤ICP备2026000000号-1',
    href: 'https://beian.miit.gov.cn/',
  },
}

export const homePageMockData: HomePageData = {
  nav: homeNav,
  hero: homeHero,
  featuredPosts,
  highlightMetrics,
  entrySections,
  about: homeAbout,
  footer: homeFooter,
}

// 模拟接口异步行为，后续切到真实接口时页面层无需改动。
export function getHomePageDataMock(): Promise<HomePageData> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(homePageMockData)
    }, 160)
  })
}

// 对接口数据做一次标准化，避免字段缺失时页面直接报错。
export function normalizeHomePageData(data: Partial<HomePageData>): HomePageData {
  return {
    nav: {
      ...homeNav,
      ...data.nav,
      brand: {
        ...homeNav.brand,
        ...data.nav?.brand,
      },
      actions: data.nav?.actions ?? homeNav.actions,
    },
    hero: {
      ...homeHero,
      ...data.hero,
      actions: data.hero?.actions ?? homeHero.actions,
      stage: {
        ...homeHero.stage,
        ...data.hero?.stage,
      },
    },
    featuredPosts: data.featuredPosts ?? featuredPosts,
    highlightMetrics: data.highlightMetrics ?? highlightMetrics,
    entrySections: data.entrySections ?? entrySections,
    about: {
      ...homeAbout,
      ...data.about,
      cards: data.about?.cards ?? homeAbout.cards,
    },
    footer: {
      ...homeFooter,
      ...data.footer,
      beian: data.footer?.beian ?? homeFooter.beian,
    },
  }
}
