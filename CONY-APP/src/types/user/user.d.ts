export interface UserInfo {
  user_id: number;
  name: string;
  email: string;
  balance: number;
  avatar_url?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
