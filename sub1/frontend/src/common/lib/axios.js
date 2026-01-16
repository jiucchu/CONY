
import VueAxios from 'vue-axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'
// import config from '../config'

const BASE_URL = '/api/v1'
const DEFAULT_ACCEPT_TYPE = 'application/json'

axios.defaults.baseURL = BASE_URL
axios.defaults.headers['Content-Type'] = DEFAULT_ACCEPT_TYPE

// Request 인터셉터: 토큰이 있으면 헤더에 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response 인터셉터: 에러 처리
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data

      if (status === 401) {
        // 401 에러 처리
        const errorMessage = errorData?.error || errorData?.message || ''
        
        if (errorMessage.includes('SignatureVerificationException') || 
            errorMessage.includes('JWTDecodeException')) {
          ElMessage.error('세션이 유효하지 않습니다.')
          // 로그아웃 처리
          localStorage.removeItem('accessToken')
          axios.defaults.headers.Authorization = ''
          window.location.href = '/'
        } else if (errorMessage.includes('TokenExpiredException')) {
          ElMessage.error('세션이 만료되었습니다.')
          // 로그아웃 처리
          localStorage.removeItem('accessToken')
          axios.defaults.headers.Authorization = ''
          window.location.href = '/'
        } else {
          // 기타 401 에러
          const message = errorData?.message || '인증에 실패했습니다.'
          ElMessage.error(message)
        }
      } else if (status === 403) {
        // 403 에러 처리
        const errorMessage = errorData?.error || errorData?.message || ''
        if (errorMessage.includes('Forbidden')) {
          ElMessage.error('접근 권한이 없습니다.')
        } else {
          ElMessage.error(errorData?.message || '접근 권한이 없습니다.')
        }
      }
    }
    return Promise.reject(error)
  }
)

export { VueAxios, axios }
export default { VueAxios, axios }
