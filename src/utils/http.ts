import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

import { appConfig } from '../config/app'

// 统一创建请求实例，后续只需调整配置即可切换后端地址。
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: appConfig.apiBaseURL,
    withCredentials: true,
    timeout: 10000,
  })

  // 请求拦截器预留鉴权、traceId 等逻辑入口。
  instance.interceptors.request.use(
    (config) => config,
    (error: AxiosError) => Promise.reject(error),
  )

  // 响应拦截器统一处理响应和错误透传。
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => Promise.reject(error),
  )

  return instance
}

export const http = createHttpClient()

// 二次封装 request，方便后续做统一泛型返回和调用规范。
export function request<T = unknown>(config: AxiosRequestConfig) {
  return http.request<T>(config)
}

export function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return http.get<T>(url, config)
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return http.post<T>(url, data, config)
}

export function patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return http.patch<T>(url, data, config)
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return http.delete<T>(url, config)
}

export default http
