package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface GifticonService {
    List<GifticonAnalysisResponseDto> analyzeGifticon(List<MultipartFile> images);
    List<Long> registerGifticon(List<GifticonRegisterRequestDto> requests, Long userId, MultipartFile image, MultipartFile thumbnail);

    Page<GifticonListResponseDto> getMyGifticons(Long userId, GifticonSearchCondition condition, Pageable pageable);
    GifticonDetailResponseDto getGifticonDetail(Long gifticonId, Long userId);

    Long updateGifticon(Long gifticonId, Long userId, GifticonUpdateRequestDto request, MultipartFile image, MultipartFile thumbnail);

    Long useGifticon(Long gifticonId, Long userId, GifticonUseRequestDto request);
    void cancelUseGifticon(Long logId, Long userId, boolean isProduct);
    void updateUsageLog(Long logId, Long userId, GifticonLogUpdateRequestDto request);

    // 자동판매 관련
    List<AutoSaleTargetResponseDto> getAutoSaleTargetsWithoutNotification();
    List<AutoSaleTargetResponseDto> getAutoSaleTargetsWithNotification();
    void markAutoSaleProcessed(Long gifticonId);
}
