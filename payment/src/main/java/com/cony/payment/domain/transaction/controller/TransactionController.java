package com.cony.payment.domain.transaction.controller;

import com.cony.payment.domain.transaction.dto.TransactionResponse;
import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.service.TransactionService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    /**
     * 거래 내역 목록 조회 (페이징)
     * @param userId 사용자 ID
     * @param page 페이지 번호 (default: 0)
     * @param size 페이지 크기 (default: 20)
     * @param type 거래 유형 (선택)
     * @return 거래 내역 목록
     */
    @GetMapping
    public ApiResponse<Page<TransactionResponse>> getTransactions(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TransactionType type) {

        log.info("거래 내역 조회: userId={}, page={}, size={}, type={}", userId, page, size, type);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions;

        if (type != null) {
            transactions = transactionService.getTransactionsByUserAndType(user, type, pageable);
        } else {
            transactions = transactionService.getTransactionsByUser(user, pageable);
        }

        Page<TransactionResponse> response = transactions.map(TransactionResponse::from);

        return ApiResponse.success(response);
    }

    /**
     * 거래 내역 상세 조회
     * @param transactionId 거래 ID
     * @return 거래 내역 상세
     */
    @GetMapping("/{transactionId}")
    public ApiResponse<TransactionResponse> getTransaction(@PathVariable Long transactionId) {
        log.info("거래 내역 상세 조회: transactionId={}", transactionId);

        Transaction transaction = transactionService.getTransaction(transactionId);
        TransactionResponse response = TransactionResponse.from(transaction);

        return ApiResponse.success(response);
    }

    /**
     * 사용자별 거래 내역 조회
     * @param userId 사용자 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 거래 내역 목록
     */
    @GetMapping("/user/{userId}")
    public ApiResponse<Page<TransactionResponse>> getTransactionsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("사용자별 거래 내역 조회: userId={}, page={}, size={}", userId, page, size);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionService.getTransactionsByUser(user, pageable);
        Page<TransactionResponse> response = transactions.map(TransactionResponse::from);

        return ApiResponse.success(response);
    }

    /**
     * 최근 거래 내역 조회 (최근 10개)
     * @param userId 사용자 ID
     * @return 최근 거래 내역
     */
    @GetMapping("/recent/{userId}")
    public ApiResponse<List<TransactionResponse>> getRecentTransactions(@PathVariable Long userId) {
        log.info("최근 거래 내역 조회: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Transaction> transactions = transactionService.getRecentTransactions(user);
        List<TransactionResponse> response = transactions.stream()
                .map(TransactionResponse::from)
                .collect(Collectors.toList());

        return ApiResponse.success(response);
    }
}