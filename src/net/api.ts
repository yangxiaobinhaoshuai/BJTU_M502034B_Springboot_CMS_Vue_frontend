/**
 *  refer to https://juejin.cn/post/7209924355803168825
 */


import axiosInstance from '../net/definaions'

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * http://localhost:8080/traveler/birth_year_range?from=1990&to=2004
 * http://localhost:8080/traveler/mile_range?from=1284&to=14505
 * http://localhost:8080/traveler/time_range?from=2&to=63
 */
export async function get<T>(url: string, params?: any): Promise<ApiResult<T>> {
  const response = await axiosInstance.get<ApiResult<T>>(url, { params })
  return response.data
}
