package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "기프티콘 목록 검색 조건")
public class GifticonSearchCondition {
    @Schema(description = "만료 임박 여부 (true: 오늘부터 1달 이내)", example = "true")
    private Boolean expiringSoon;
    @Schema(description = "사용 완료 제외 여부 (true: 사용 완료된 기프티콘 제외)", example = "true")
    private Boolean excludeUsed;
    @Schema(description = "특정 카테고리 ID로 필터링 (없으면 전체 조회)", example = "1")
    private Integer categoryId;
}
