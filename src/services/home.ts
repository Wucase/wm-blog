import { appConfig } from '../config/app'
import {
  getHomePageDataMock,
  normalizeHomePageData,
} from '../data/home'
import { mergeMockHomePageSettings } from './homeSettings'
import type { HomePageData } from '../types/home'
import { http } from '../utils/http'

interface HomePageResponse {
  data: HomePageData
}

// 首页数据服务层，统一处理 mock / 后端切换逻辑。
export async function getHomePageData(): Promise<HomePageData> {
  if (appConfig.useMock) {
    const mockData = await getHomePageDataMock()
    return mergeMockHomePageSettings(mockData)
  }

  const response = await http.get<HomePageResponse | HomePageData>('/home')
  return mapHomePageResponse(response.data)
}

// 后续如果后端字段名和前端结构不一致，可以在这里集中做映射。
export function mapHomePageResponse(responseData: HomePageResponse | HomePageData) {
  const pageData = 'data' in responseData ? responseData.data : responseData
  return normalizeHomePageData(pageData)
}
