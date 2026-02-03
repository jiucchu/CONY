package com.cony.payment.domain.user.controller;

import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.dto.OnSaleCountResponseDto;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * 내부 API - Manage 서버에서 호출
 */
@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final SaleRepository saleRepository;

    /**
     * 판매 중인 상품 개수 조회 (내부 API)
     */
    @GetMapping("/{userId}/sales/on-sale/count")
    public ApiResponse<OnSaleCountResponseDto> getOnSaleCount(@PathVariable Long userId) {
        long count = saleRepository.countBySellerIdAndStatus(userId, SaleStatus.ON_SALE);
        return ApiResponse.success("판매중 개수를 조회했습니다.", new OnSaleCountResponseDto(count));
    }

    /**
     * 회원 탈퇴 동기화 (내부 API)
     */
    @PostMapping("/{userId}/withdraw")
    @Transactional
    public ApiResponse<Void> withdraw(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.withdraw();

        log.info("Payment 서버 회원 탈퇴 동기화 완료: userId={}", userId);
        return ApiResponse.success("회원 탈퇴가 동기화되었습니다.");
    }
}
