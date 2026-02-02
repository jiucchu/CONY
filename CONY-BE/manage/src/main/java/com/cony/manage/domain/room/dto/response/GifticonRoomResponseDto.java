package com.cony.manage.domain.room.dto.response;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
@Schema(description = "방 내 기프티콘 조회 응답")
public class GifticonRoomResponseDto {
    @Schema(description = "기프티콘 ID", example = "10")
    private Long gifticonId;

    @Schema(description = "브랜드명", example = "스타벅스")
    private String brandName;

    @Schema(description = "상품명", example = "아이스 아메리카노")
    private String productName;

    @Schema(description = "이미지 URL")
    private String imageUrl;

    @Schema(description = "유효기간", example = "2024-12-31")
    private LocalDate expiryDate;

    @Schema(description = "D-Day", example = "D-30")
    private String dDay;

    @Schema(description = "기프티콘 상태", example = "AVAILABLE")
    private GifticonStatus status;

    public static GifticonRoomResponseDto from(Gifticon gifticon) {
        return GifticonRoomResponseDto.builder()
                .gifticonId(gifticon.getId())
                .brandName(gifticon.getBrand().getName())
                .productName(gifticon.getProductName())
                .imageUrl(null) // TODO: Image URL processing if needed, currently assume null or add to entity
                .expiryDate(gifticon.getExpiryDate())
                .dDay(calculateDday(gifticon.getExpiryDate()))
                .status(gifticon.getStatus())
                .build();
    }

    private static String calculateDday(LocalDate expiryDate) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
        if (days < 0) {
            return "EXPIRED";
        } else if (days == 0) {
            return "D-Day";
        } else {
            return "D-" + days;
        }
    }
}
