package com.cony.manage.domain.gifticon.entity;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import com.cony.manage.domain.room.entity.Room;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.time.LocalDate;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "GIFTICON")
public class Gifticon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gifticon_id")
    private Long id;

    private String productName;
    private String brandName;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private GifticonType gifticonType;

    private Integer originalPrice;
    private Integer currentBalance;

    private String barcodeNumber;
    @Enumerated(EnumType.STRING)
    private GifticonStatus status;

    // === 자동판매 설정 === //
    private LocalDate scheduledSaleDate;            // 판매 예정일 (null이면 자동판매 OFF)

    private Integer plannedSalePrice;               // 판매 예정 금액

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    // 정렬을 위한 가상 컬럼 (DB에 생성되지 않음, 조회용)
    // status가 'USED'면 1, 아니면 0을 반환
    // 0(미사용,사용중) -> 1(사용완료) 순서로 정렬됨
    @Formula("(CASE WHEN status = 'USED' THEN 1 ELSE 0 END)")
    private int statusOrder;


    // === 비지니스 로직 === //
    public void updateInformation(Brand brand, Category category, String productName, LocalDate expiryDate,
            Integer originalPrice) {
        this.brand = brand;
        this.category = category;
        this.productName = productName;
        this.expiryDate = expiryDate;
        this.originalPrice = originalPrice;
        this.currentBalance = originalPrice;
    }

    /**
     * 비지니스 로직: 기프티콘 사용(금액 차감)
     * 
     * @param amount 사용 금액
     */
    public void use(Integer amount) {
        if (this.status == GifticonStatus.USED) {
            throw new CustomException(ErrorCode.ALREADY_USED_GIFTICON);
        }

        if (this.currentBalance < amount) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        this.currentBalance -= amount;

        if (this.currentBalance.equals(0)) {
            this.status = GifticonStatus.USED;
        } else {
            this.status = GifticonStatus.IN_USE;
        }
    }

    /**
     * 비지니스 로직: 기프티콘 사용 취소(잔액 복구)
     * 
     * @param amount 취소 금액
     */
    public void cancelUse(Integer amount) {
        this.currentBalance += amount;

        if (this.currentBalance > this.originalPrice) {
            this.currentBalance = this.originalPrice;
        }

        if (this.currentBalance.equals(this.originalPrice)) {
            this.status = GifticonStatus.NOT_USED;
        } else if (this.status == GifticonStatus.USED && this.currentBalance > 0) {
            this.status = GifticonStatus.IN_USE;
        }
    }

    /**
     * 비지니스 로직: 사용 금액 수적에 따른 잔액 조정
     * 
     * @param oldAmount 기존 사용 금액
     * @param newAmount 새로 수정할 사용 금액
     */
    public void updateUsageAmount(Integer oldAmount, Integer newAmount) {
        int diff = oldAmount - newAmount;

        if (this.currentBalance + diff < 0) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        this.currentBalance += diff;

        if (this.currentBalance > this.originalPrice) {
            this.currentBalance = this.originalPrice;
        }

        if (this.currentBalance.equals(0)) {
            this.status = GifticonStatus.USED;
        } else if (this.currentBalance.equals(this.originalPrice)) {
            this.status = GifticonStatus.NOT_USED;
        } else {
            this.status = GifticonStatus.IN_USE;
        }
    }

    /**
     * 비즈니스 로직: 자동판매 설정 업데이트
     * @param scheduledDate 판매 예정일 (null이면 자동판매 OFF)
     * @param salePrice 판매 예정 금액
     */
    public void updateAutoSaleSetting(LocalDate scheduledDate, Integer salePrice) {
        this.scheduledSaleDate = scheduledDate;
        this.plannedSalePrice = salePrice;
    }

    /**
     * 비즈니스 로직: 자동판매 설정 초기화 (판매 완료 후)
     */
    public void clearAutoSaleSetting() {
        this.scheduledSaleDate = null;
        this.plannedSalePrice = null;
    }
}
