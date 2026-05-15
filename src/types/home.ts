// 首页数据结构统一定义，便于 mock 数据和真实接口共用同一套类型。
export interface HomeHeroAction {
  label: string
  href: string
  variant: 'primary' | 'secondary'
}

export interface HomeNavBrand {
  logoText: string
  name: string
  subTitle: string
  href: string
}

export interface HomeNavAction {
  label: string
  href: string
  variant: 'ghost' | 'solid'
}

export interface HomeNavUserMenuItem {
  label: string
  href: string
  action?: 'navigate' | 'logout'
}

export interface HomeNavUser {
  name: string
  avatarText: string
  createHref: string
  menu: HomeNavUserMenuItem[]
}

export interface HomeNavData {
  brand: HomeNavBrand
  actions: HomeNavAction[]
}

export interface HomeHeroStage {
  badge: string
  title: string
  description: string
  leftCardImage: string
  leftCardAlt: string
  rightCardImage: string
  rightCardAlt: string
  noteLabel: string
  noteValue: string
}

export interface HomeHeroData {
  eyebrow: string
  title: string
  description: string
  actions: HomeHeroAction[]
  stage: HomeHeroStage
}

export interface FeaturedPost {
  title: string
  tag: string
  summary: string
  image: string
}

export interface HighlightMetric {
  value: string
  label: string
  description: string
}

export interface EntrySection {
  index: string
  title: string
  description: string
}

export interface HomeAboutCard {
  label: string
  value: string
}

export interface HomeAboutData {
  eyebrow: string
  title: string
  description: string
  cards: HomeAboutCard[]
}

export interface HomeFooterRecord {
  label: string
  href: string
}

export interface HomeFooterData {
  copyright: string
  beian?: HomeFooterRecord
}

export interface HomePageData {
  nav: HomeNavData
  hero: HomeHeroData
  featuredPosts: FeaturedPost[]
  highlightMetrics: HighlightMetric[]
  entrySections: EntrySection[]
  about: HomeAboutData
  footer: HomeFooterData
}
