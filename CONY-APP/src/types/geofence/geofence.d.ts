// Geofence API 타입 정의

export interface GeofenceRequestDto {
  lat: number; // 위도 (required, 범위: 33-43)
  lon: number; // 경도 (required, 범위: 124-132)
  radius?: number; // 반경 (optional, 미터 단위)
  brandIds?: number[]; // 브랜드 ID 배열 (optional)
}

export interface CenterPoint {
  lat: number;
  lon: number;
  refreshRadius: number;
}

export interface StoreSummary {
  id: string; // 매장 ID
  name: string; // 매장 이름
  brandId: number; // 브랜드 ID (로고 표시용)
  lat: number; // 개별 매장 위도
  lon: number; // 개별 매장 경도
}

export interface MapPoint {
  type: 'STORE' | 'CLUSTER';
  id: string;
  name: string;
  lat: number;
  lon: number;
  triggerRadius: number;
  includedStores?: StoreSummary[];
}

export interface GeofenceResponseDto {
  center: CenterPoint;
  points: MapPoint[];
}
