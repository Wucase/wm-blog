// 通过环境变量控制是否使用 mock 数据，后续切换后端时无需改页面代码。
export const appConfig = {
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  apiBaseURL: import.meta.env.VITE_API_BASE_URL || '/api',
}
