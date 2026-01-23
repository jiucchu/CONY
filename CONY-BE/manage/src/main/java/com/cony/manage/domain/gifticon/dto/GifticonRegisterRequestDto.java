package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class GifticonRegisterRequestDto { // OCR, 사용자 검수까지 마친 최종 등록 요청 dto
    private String brandName;
    private String productName;
    private String categoryName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private Integer originalPrice;
    private GifticonType type;
    private String imageUrl;
}
