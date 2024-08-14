import axios from 'axios'
import myLogger from '@/log/MyLogger'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/traveler/',
  timeout: 5000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    //myLogger.d("request interceptor, config,",config)
    return config
  },
  (error: any) => {
    // 处理请求错误
    myLogger.d('axios request failed: ', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    //myLogger.d('response interceptor, response,', response)
    return response
  },
  (error: any) => {
    // 处理响应错误
    myLogger.d('axios response failed: ', error)
    return Promise.reject(error)
  }
)

export default axiosInstance
