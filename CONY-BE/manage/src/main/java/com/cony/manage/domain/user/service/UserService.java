package com.cony.manage.domain.user.service;

import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.room.enums.RoomRole;
import com.cony.manage.domain.room.repository.RoomMemberRepository;
import com.cony.manage.domain.user.dto.UserActivityStatsDto;
import com.cony.manage.domain.user.dto.UserDashboardResponseDto;
import com.cony.manage.domain.user.dto.WithdrawalCheckResponseDto;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.infrastructure.payment.client.PaymentClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final GifticonRepository gifticonRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final PaymentClient paymentClient;

    /**
     * 마이페이지 대시보드 조회
     */
    public UserDashboardResponseDto getDashboard(Long userId) {
        User user = getUserOrThrow(userId);

        // 이미 탈퇴한 회원인지 확인
        if (user.isWithdrawn()) {
            throw new CustomException(ErrorCode.USER_ALREADY_WITHDRAWN);
        }

        // 활동 통계 조회
        long gifticonCount = gifticonRepository.countByUserId(userId);
        long sharingRoomCount = roomMemberRepository.countByUserId(userId);
        Long onSaleCount = paymentClient.getOnSaleCount(userId);

        UserActivityStatsDto stats = UserActivityStatsDto.builder()
                .gifticonCount(gifticonCount)
                .sharingRoomCount(sharingRoomCount)
                .onSaleCount(onSaleCount)
                .build();

        return UserDashboardResponseDto.of(user, stats);
    }

    /**
     * 회원 탈퇴 가능 여부 확인
     */
    public WithdrawalCheckResponseDto checkWithdrawal(Long userId) {
        User user = getUserOrThrow(userId);

        // 이미 탈퇴한 회원인지 확인
        if (user.isWithdrawn()) {
            throw new CustomException(ErrorCode.USER_ALREADY_WITHDRAWN);
        }

        List<String> blockingReasons = new ArrayList<>();

        // 1. 판매 중인 상품이 있는지 확인
        Long onSaleCount = paymentClient.getOnSaleCount(userId);
        if (onSaleCount > 0) {
            blockingReasons.add("판매 중인 상품이 " + onSaleCount + "개 있습니다.");
        }

        // 2. 공유방 방장인지 확인
        boolean isRoomOwner = roomMemberRepository.existsByUserIdAndRole(userId, RoomRole.OWNER);
        if (isRoomOwner) {
            blockingReasons.add("방장으로 있는 공유방이 있습니다.");
        }

        boolean canWithdraw = blockingReasons.isEmpty();

        return WithdrawalCheckResponseDto.builder()
                .canWithdraw(canWithdraw)
                .remainingPoints(user.getPointBalance())
                .blockingReasons(blockingReasons)
                .build();
    }

    /**
     * 회원 탈퇴 처리
     */
    @Transactional
    public void withdraw(Long userId) {
        User user = getUserOrThrow(userId);

        // 이미 탈퇴한 회원인지 확인
        if (user.isWithdrawn()) {
            throw new CustomException(ErrorCode.USER_ALREADY_WITHDRAWN);
        }

        // 탈퇴 가능 여부 재검증
        WithdrawalCheckResponseDto check = checkWithdrawal(userId);
        if (!check.isCanWithdraw()) {
            throw new CustomException(ErrorCode.CANNOT_WITHDRAW);
        }

        // Manage DB 처리 - 개인정보 마스킹 및 상태 변경
        user.withdraw();

        // Payment 서버 동기화
        paymentClient.syncUserWithdrawal(userId);

        log.info("회원 탈퇴 처리 완료: userId={}", userId);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
