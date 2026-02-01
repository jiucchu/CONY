package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface GifticonRepository extends JpaRepository<Gifticon, Long>, JpaSpecificationExecutor<Gifticon> {
    boolean existsByBarcodeNumber(String barcodeNumber);
    
    // 사용자별 바코드 중복 체크
    boolean existsByBarcodeNumberAndUserId(String barcodeNumber, Long userId);

    // 내 기프티콘 목록 페이징 조회
    // N+1 문제 방지를 위한 fetch join 사용
    // batch size 를 사용하기 때문에 fetch join 제거.
    Page<Gifticon> findByUserId(Long userId, Pageable pageable);

    Page<Gifticon> findByUserIdAndStatus(Long userId, GifticonStatus status, Pageable pageable);

    @Query("SELECT DISTINCT g.brand.id as id, g.brand.name as name, g.brand.iconUrl as iconUrl FROM Gifticon g WHERE g.user.id = :userId AND g.status <> :excludeStatus")
    List<BrandProjection> findDistinctBrandsByUserId(@Param("userId") Long userId,
            @Param("excludeStatus") GifticonStatus excludeStatus);

    /**
     * 자동판매 대상 기프티콘 조회 (알림 불필요 - 사용자가 직접 설정)
     * - 판매 예정일이 설정되어 있고 (scheduledSaleDate IS NOT NULL)
     * - 판매 예정일이 오늘 이전이거나 오늘
     * - 미사용 상태
     */
    @Query("SELECT g FROM Gifticon g WHERE g.scheduledSaleDate IS NOT NULL " +
           "AND g.scheduledSaleDate <= :today " +
           "AND g.status = :status")
    List<Gifticon> findAutoSaleTargetsWithoutNotification(@Param("today") LocalDate today, @Param("status") GifticonStatus status);

    /**
     * 시스템 제안 대상 기프티콘 조회 (알림 필요 - 유효기간 1달 이내)
     * - 자동판매 미설정 (scheduledSaleDate IS NULL)
     * - 유효기간이 1달 이내
     * - 미사용 상태
     */
    @Query("SELECT g FROM Gifticon g WHERE g.scheduledSaleDate IS NULL " +
           "AND g.expiryDate <= :oneMonthLater " +
           "AND g.expiryDate > :today " +
           "AND g.status = :status")
    List<Gifticon> findAutoSaleTargetsWithNotification(
            @Param("today") LocalDate today,
            @Param("oneMonthLater") LocalDate oneMonthLater,
            @Param("status") GifticonStatus status);

    @Query("SELECT g FROM Gifticon g WHERE g.room.id = :roomId")
    Page<Gifticon> findAllByRoomId(@Param("roomId") Long roomId, Pageable pageable);
}
