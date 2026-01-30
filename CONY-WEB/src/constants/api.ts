export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://i14c106.p.ssafy.io/api/manage';

export const API_ENDPOINTS = {
  // Gifticon
  GIFTCONS: '/v1/gifticons',
  GIFTCON_DETAIL: (id: number) => `/v1/gifticons/${id}`,
  GIFTCON_USE: (id: number) => `/v1/gifticons/${id}/use`,
  GIFTCON_ANALYZE: '/v1/gifticons/analyze',
  GIFTCON_LOG_UPDATE: (logId: number) => `/v1/gifticons/log/${logId}`,
  GIFTCON_LOG_CANCEL: (logId: number) => `/v1/gifticons/log/${logId}/cancel`,
  HEALTH_CHECK: '/health-check',
} as const;
