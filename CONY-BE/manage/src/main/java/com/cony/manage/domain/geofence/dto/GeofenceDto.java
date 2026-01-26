package com.cony.manage.domain.geofence.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class GeofenceDto {

    @Getter
    @Builder
    @Schema(description = "주변 매장 검색 요청")
    public static class Request {
        @Schema(description = "사용자 현재 위도", example = "37.498095")
        @NotNull(message = "위도는 필수입니다.")
        @Min(33) @Max(43) // 대한민국 대략적 범위
        private Double lat;

        @Schema(description = "사용자 현재 경도", example = "127.027610")
        @NotNull(message = "경도는 필수입니다.")
        @Min(124) @Max(132)
        private Double lon;

        @Schema(description = "검색 반경 (미터 단위, 기본값 500m)", example = "500")
        @Builder.Default
        private double radius = 500; // 기본 500m

        @Schema(description = "필터링할 브랜드 ID 목록 (없으면 전체)", example = "[1, 2]")
        private List<Long> brandIds;
    }

    @Getter
    @Builder
    @Schema(description = "주변 매장 검색 응답")
    public static class Response {
        @Schema(description = "검색 중심 좌표 (요청받은 좌표)")
        private CenterPoint center;

        @Schema(description = "지도에 표시할 마커 목록 (매장 또는 클러스터)")
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
    @Schema(description = "지도 마커 포인트")
    public static class MapPoint {
        @Schema(description = "마커 타입 (STORE: 단일 매장, CLUSTER: 매장 뭉침)", example = "STORE")
        private String type;         // "STORE" (단일 매장) 또는 "CLUSTER" (매장 묶음)
        @Schema(description = "매장 ID 또는 대표 ID", example = "101")
        private String id;           // 지오펜스 등록 ID (Client 식별용)
        @Schema(description = "마커 표시 이름 (예: 스타벅스 강남점 or 스타벅스 외 2곳)", example = "스타벅스 강남점")
        private String name;         // "스타벅스 강남점" 또는 "스타벅스 외 4건"
        @Schema(description = "위도")
        private double lat;
        @Schema(description = "경도")
        private double lon;
        @Schema(description = "지오펜싱 트리거 반경 (m) - 클러스터면 더 넓게 잡힘", example = "100")
        private int triggerRadius;   // 지오펜스 감지 반경 (STORE=100m, CLUSTER=300m 등)

        // 클러스터일 경우 포함된 매장들의 상세 정보 (선택적)
//        private List<String> includedStoreNames;
        private List<StoreSummary> includedStores;
    }

    @Builder
    @Getter
    public static class StoreSummary {
        private String id;       // 매장 ID
        private String name;     // 매장 이름
        private Long brandId;    // 브랜드 ID (로고 표시용)
        private double lat;      // 개별 매장 위도
        private double lon;      // 개별 매장 경도
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