package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "기프티콘 사용 이력 정보")
public class GifticonUsageLogResponseDto {
    @Schema(description = "사용 이력 ID (Log ID)", example = "10")
    private Long logId;
    
    @Schema(description = "사용 금액", example = "4500")
    private Integer usedAmount;
    
    @Schema(description = "사용 일시")
    private LocalDateTime usedAt;
}