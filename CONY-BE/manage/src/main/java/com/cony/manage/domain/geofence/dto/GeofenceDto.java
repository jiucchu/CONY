package com.cony.manage.domain.geofence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class GeofenceDto {

    @Getter
    @Builder
    public static class Request {
        private double userLat;        // 사용자 현재 위도
        private double userLon;        // 사용자 현재 경도
        private List<Long> brandIds;   // 사용자가 보유한 기프티콘의 브랜드 ID 목록 (필터링용)
    }

    @Getter
    @Builder
    public static class Response {
        // [Macro Geofence] 다음 갱신 시점을 결정하는 큰 원
        private CenterPoint center;

        // [Micro Geofence] 실제 감시해야 할 지점들 (매장 또는 클러스터)
        private List<MapPoint> points;
    }

    @Getter
    @Builder
    public static class CenterPoint {
        private double lat;
        private double lon;
        private int refreshRadius; // 예: 2000m (이 범위를 벗어나면 재요청)
    }

    /**
     * 지도상의 점 (매장 하나일 수도 있고, 여러 매장의 묶음일 수도 있음)
     */
    @Getter
    @Builder
    public static class MapPoint {
        private String type;         // "STORE" (단일 매장) 또는 "CLUSTER" (매장 묶음)
        private String id;           // 지오펜스 등록 ID (Client 식별용)
        private String name;         // "스타벅스 강남점" 또는 "스타벅스 외 4건"
        private double lat;
        private double lon;
        private int triggerRadius;   // 지오펜스 감지 반경 (STORE=100m, CLUSTER=300m 등)

        // 클러스터일 경우 포함된 매장들의 상세 정보 (선택적)
        private List<String> includedStoreNames;
    }

    // 내부 연산용 데이터 홀더 (서비스 로직 내에서만 사용)
    @Getter
    @Builder
    public static class InternalStoreData {
        private Long storeId;
        private String storeName;
        private Long brandId;
        private double lat;
        private double lon;
        private double distance; // 사용자로부터의 거리
    }
}