package com.cony.manage.domain.room.dto.response;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
public class GifticonRoomResponseDto {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private String imageUrl;
    private LocalDate expiryDate;
    private String dDay;
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
