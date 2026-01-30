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
  storeId: number;
  brandName: string;
  storeName: string;
  address: string;
  distance: number;
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
