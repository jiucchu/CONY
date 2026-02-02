package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "기프티콘 목록 검색 조건")
public class GifticonSearchCondition {
    @Schema(description = "만료 임박 여부 (true: 오늘부터 1달 이내)", example = "true")
    private Boolean expiringSoon;
    @Schema(description = "사용 완료 제외 여부 (true: 사용 완료된 기프티콘 제외)", example = "true")
    private Boolean excludeUsed;
    @Schema(description = "특정 카테고리 ID로 필터링 (없으면 전체 조회)", example = "1")
    private Integer categoryId;

    @Schema(description = "현재 위도 (근처 매장 필터링용)", example = "37.5665")
    private Double latitude;

    @Schema(description = "현재 경도 (근처 매장 필터링용)", example = "126.9780")
    private Double longitude;

    @Schema(description = "검색 반경 (m단위, 기본 1000m)", example = "1000")
    private Integer radius = 1000;

    @Schema(description = "브랜드명 검색 (부분일치)", example = "스타벅스")
    private String brandName;

    @Schema(description = "상품명 검색 (부분일치)", example = "아메리카노")
    private String productName;

    // 이 필드는 Controller가 아닌 Service 내부에서 Redis 조회 후 채워넣을 용도입니다.
    @Hidden
    private List<Long> nearbyBrandIds;
}
