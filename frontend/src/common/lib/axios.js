
import VueAxios from 'vue-axios'
import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

const BASE_URL = '/api/v1'
const DEFAULT_ACCEPT_TYPE = 'application/json'

axios.defaults.baseURL = BASE_URL
axios.defaults.headers['Content-Type'] = DEFAULT_ACCEPT_TYPE

let loadingInstance = null;

// Request Interceptor
axios.interceptors.request.use(
  config => {
    // Loading Spinner
    loadingInstance = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });

    // Token Setting
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    if (loadingInstance) loadingInstance.close();
    return Promise.reject(error);
  }
);

// Response Interceptor
axios.interceptors.response.use(
  response => {
    if (loadingInstance) loadingInstance.close();
    return response;
  },
  error => {
    if (loadingInstance) loadingInstance.close();
    
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        if (error.response.data && (error.response.data.message === "TokenExpired" || error.response.data.message === "Invalid Token")) {
           ElMessage.error('세션이 만료되었습니다.');
        } else {
           ElMessage.error('세션이 유효하지 않습니다.');
        }
        localStorage.removeItem('accessToken');
        window.location.href = '/'; // Redirect to home
      } else if (status === 403) {
        ElMessage.error('접근 권한이 없습니다.');
      } else if (status === 409) {
          // 409 is often used for business logic errors (duplicate), so maybe just let it pass or show message?
          // The component usually handles the specific message for duplicate check.
          // But if it's a generic error, we can show it.
          // For now, let's return rejection so component can handle it.
      }
    }
    return Promise.reject(error);
  }
);

export { VueAxios, axios }
export default { VueAxios, axios }
