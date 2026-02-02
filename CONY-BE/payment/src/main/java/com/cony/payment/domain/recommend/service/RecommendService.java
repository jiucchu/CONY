package com.cony.payment.domain.recommend.service;

import com.cony.payment.domain.recommend.dto.RecommendRequestDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto;

public interface RecommendService {
    public RecommendResponseDto getRecommendations(Long userId, RecommendRequestDto request);
}
