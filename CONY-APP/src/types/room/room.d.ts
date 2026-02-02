export interface RoomCreateRequestDto {
  name: string;
}

export interface RoomResponseDto {
  roomId: number;
  name: string;
  memberCount: number;
  thumbnailUrls: string[];
  roomCode?: string; // 초대 코드
}

export interface RoomMemberDto {
  userId: number;
  userName: string;
  role: 'OWNER' | 'MEMBER';
  profileImageUrl?: string;
}

export type GifticonSearchStatus = 'ALL' | 'AVAILABLE' | 'USED';

export interface GifticonRoomResponseDto {
  gifticonId: number;
  brandName: string;
  productName: string;
  imageUrl: string;
  expiryDate: string;
  dDay: string;
  status: 'NOT_USED' | 'IN_USE' | 'USED';
}

export interface PageGifticonRoomResponseDto {
  content: GifticonRoomResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
