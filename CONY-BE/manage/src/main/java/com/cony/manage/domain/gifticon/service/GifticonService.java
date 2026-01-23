package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface GifticonService {
    List<GifticonAnalysisResponseDto> analyzeGifticon(List<MultipartFile> images);
    List<Long> registerGifticon(List<GifticonRegisterRequestDto> requests, Long userId);

    Page<GifticonListResponseDto> getMyGifticons(Long userId, Pageable pageable);
    GifticonDetailResponseDto getGifticonDetail(Long gifticonId, Long userId);

    Long updateGifticon(Long gifticonId, Long userId, GifticonUpdateRequestDto request);

    Long useGifticon(Long gifticonId, Long userId, GifticonUseRequestDto request);
    void cancelUseGifticon(Long logId, Long userId);
    void updateUsageLog(Long logId, Long userId, GifticonLogUpdateRequestDto request);
}
