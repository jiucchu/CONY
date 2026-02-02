package com.cony.payment.domain.recommend.controller;

import com.cony.payment.domain.recommend.dto.RecommendRequestDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto;
import com.cony.payment.domain.recommend.service.RecommendService;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    /**
     * 추천 리스트 조회 API
     * [GET] /recommend?context=market|owned&limit=10
     */
    @GetMapping
    public ApiResponse<RecommendResponseDto> getRecommendations(@RequestPart RecommendRequestDto request) {

        Long testUserId = 1L;
        RecommendResponseDto response = recommendService.getRecommendations(testUserId, request);
        return ApiResponse.success("추천 리스트 조회 성공", response);
    }
}
