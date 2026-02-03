package com.cony.manage.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class WithdrawalCheckResponseDto {
    private boolean canWithdraw;
    private Long remainingPoints;
    private List<String> blockingReasons;
}
