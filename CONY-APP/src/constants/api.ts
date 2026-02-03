// 로컬 개발 환경 설정
// __DEV__가 true이면 로컬 서버 사용, false이면 운영 서버 사용
// Android 에뮬레이터: 10.0.2.2 (localhost를 가리킴)
// iOS 시뮬레이터: localhost
// 실제 기기: 컴퓨터의 로컬 IP 주소 사용 (예: 192.168.x.x)
const isLocalDev = false; // 배포 서버 사용으로 강제 설정
export const LOCAL_HOST = '10.0.2.2'; // Android 에뮬레이터용 (실제 기기나 iOS는 환경 변수로 변경 필요)
export const LOCAL_MANAGE_PORT = '8080'; // Manage 서버 포트
export const LOCAL_PAYMENT_PORT = '8081'; // Payment 서버 포트 (React Native가 8082 사용)

// 로컬 개발 서버 URL
// 로컬에서는 /api/manage prefix 없이 직접 접근 (Nginx 없이 직접 실행)
const LOCAL_API_BASE_URL = `https://${LOCAL_HOST}:${LOCAL_MANAGE_PORT}`;
// Payment 서버는 context-path가 /api/payment로 설정되어 있음
const LOCAL_PAYMENT_API_BASE_URL = `https://${LOCAL_HOST}:${LOCAL_PAYMENT_PORT}/api/payment`;

// 운영 서버 URL
const PROD_API_BASE_URL = 'https://i14c106.p.ssafy.io/api/manage';
const PROD_PAYMENT_API_BASE_URL = 'https://i14c106.p.ssafy.io/api/payment';

// 환경 변수로 강제 설정 가능 (환경 변수가 있으면 우선 사용)
export const API_BASE_URL = isLocalDev ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;
export const PAYMENT_API_BASE_URL = isLocalDev ? LOCAL_PAYMENT_API_BASE_URL : PROD_PAYMENT_API_BASE_URL;

// 디버깅용: 실제 사용되는 URL 확인
if (__DEV__) {
  console.log('[API Config] API_BASE_URL:', API_BASE_URL);
  console.log('[API Config] PAYMENT_API_BASE_URL:', PAYMENT_API_BASE_URL);
  console.log('[API Config] isLocalDev:', isLocalDev);
}

export const API_ENDPOINTS = {
  // Auth
  AUTH_REISSUE: '/api/auth/reissue',
  AUTH_OAUTH_GOOGLE: '/v1/auth/oauth/google',
  AUTH_OAUTH_APPLE: '/v1/auth/oauth/apple',
  AUTH_OAUTH_KAKAO: '/v1/auth/oauth/kakao',
  AUTH_OAUTH_CALLBACK: '/v1/auth/oauth/callback',
  // Gifticon
  GIFTCONS: '/v1/gifticons',
  GIFTCON_DETAIL: (id: number) => `/v1/gifticons/${id}`,
  GIFTCON_USE: (id: number) => `/v1/gifticons/${id}/use`,
  GIFTCON_ANALYZE: '/v1/gifticons/analyze',
  GIFTCON_LOG_UPDATE: (logId: number) => `/v1/gifticons/log/${logId}`,
  GIFTCON_LOG_CANCEL: (logId: number) => `/v1/gifticons/log/${logId}/cancel`,
  // Geofence
  GEOFENCE_NEARBY: '/v1/geofence/nearby',
  // Room
  ROOMS: '/v1/rooms',
  ROOM_DETAIL: (id: number) => `/v1/rooms/${id}`,
  ROOM_GIFTICONS: (id: number) => `/v1/rooms/${id}/gifticons`,
  // Point
  POINTS: '/points',
  // Sale
  SALES: '/sales',
  SALE_DETAIL: (id: number) => `/sales/${id}`,
  SALE_MY: '/sales/my',
  SALE_MY_STATS: '/sales/my/stats',
  SALE_MY_SOLD: '/sales/my/sold',
  SALE_BRANDS: '/sales/brands',
  SALE_SUGGESTIONS: '/sales/suggestions',
  SALE_START: (id: number) => `/sales/${id}/start`,
  // Purchase
  PURCHASES: '/purchases',
  PURCHASE_MY: '/purchases/my',
  PURCHASE_GIFTICON: (saleId: number) => `/purchases/${saleId}`,
  // Transaction
  TRANSACTIONS: '/transactions',
  TRANSACTION_DETAIL: (id: number) => `/transactions/${id}`,
  TRANSACTIONS_RECENT: '/transactions/recent',
  // Report
  REPORTS: '/reports',
  REPORT_APPROVE: (id: number) => `/reports/${id}/approve`,
  // Payment
  PAYMENT_READY: '/payments/ready',
  PAYMENT_APPROVE: '/payments/approve',
  PAYMENT_CANCEL: '/payments/cancel',
  PAYMENT_FAIL: '/payments/fail',
  HEALTH_CHECK: '/health-check',
} as const;
