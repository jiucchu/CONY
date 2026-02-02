package com.cony.payment.domain.transaction.controller;

import com.cony.payment.domain.transaction.controller.docs.TransactionControllerDocs;
import com.cony.payment.domain.transaction.dto.TransactionResponse;
import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.service.TransactionService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.auth.annotation.AuthUser;
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
public class TransactionController implements TransactionControllerDocs {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @Override
    @GetMapping
    public ApiResponse<Page<TransactionResponse>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TransactionType type,
            @AuthUser Long userId) {

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

    @Override
    @GetMapping("/{transactionId}")
    public ApiResponse<TransactionResponse> getTransaction(@PathVariable Long transactionId) {
        log.info("거래 내역 상세 조회: transactionId={}", transactionId);

        Transaction transaction = transactionService.getTransaction(transactionId);
        TransactionResponse response = TransactionResponse.from(transaction);

        return ApiResponse.success(response);
    }

    @Override
    @GetMapping("/recent")
    public ApiResponse<List<TransactionResponse>> getRecentTransactions(@AuthUser Long userId) {
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