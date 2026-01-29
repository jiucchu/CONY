package com.cony.payment.domain.recommend.controller;

import com.cony.payment.domain.recommend.dto.RecommendResponseDto;
import com.cony.payment.domain.recommend.service.RecommendService;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ApiResponse<RecommendResponseDto> getRecommendations(
            @RequestParam String context,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long testUserId = 1L;
        RecommendResponseDto response = recommendService.getRecommendations(testUserId, context, limit, authorization);
        return ApiResponse.success("추천 리스트 조회 성공", response);
    }
}
