// OAuth 엔드포인트는 /api/manage 경로를 사용해야 합니다 (백엔드 Swagger 설정 참고)
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://i14c106.p.ssafy.io/api/manage';

// 인증 상태 확인
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
};

// 토큰 가져오기
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

// 토큰 저장
export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// 로그아웃
export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// OAuth 콜백에서 토큰 가져오기
export const fetchTokens = async () => {
  const res = await fetch(`${API_URL}/v1/auth/oauth/callback`, {
    method: "GET",
    credentials: "include", 
  });
  if (!res.ok) throw new Error("토큰 요청 실패");
  const data = await res.json();
  const { accessToken, refreshToken } = data.data;
  setTokens(accessToken, refreshToken);
  return { accessToken, refreshToken };
};
