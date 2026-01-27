package com.cony.payment.domain.point.service;

import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.service.TransactionService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PointService {

    private final UserRepository userRepository;
    private final TransactionService transactionService;

    /**
     * 포인트 충전
     * @param userId 사용자 ID
     * @param amount 충전 금액
     * @return 충전 후 잔액
     */
    @Transactional
    public Long chargePoint(Long userId, Long amount) {
        log.info("포인트 충전 시작: userId={}, amount={}", userId, amount);

        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 금액 유효성 검사
        if (amount == null || amount <= 0) {
            throw new CustomException(ErrorCode.INVALID_POINT_AMOUNT);
        }

        // 3. 포인트 충전
        user.chargePoint(amount);
        userRepository.save(user);

        // 4. 거래 내역 저장
        transactionService.createTransaction(
                user,
                TransactionType.CHARGE,
                amount,
                "카카오페이 포인트 충전"
        );

        log.info("포인트 충전 완료: userId={}, 충전금액={}, 잔액={}", userId, amount, user.getPointBalance());
        return user.getPointBalance();
    }

    /**
     * 포인트 잔액 조회
     * @param userId 사용자 ID
     * @return 포인트 잔액
     */
    public Long getPointBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return user.getPointBalance();
    }
}