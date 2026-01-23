package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface GifticonRepository extends JpaRepository<Gifticon, Long> {
    boolean existsByBarcodeNumber(String barcodeNumber);

    // 내 기프티콘 목록 페이징 조회
    // N+1 문제 방지를 위한 fetch join 사용
    @Query("SELECT g FROM Gifticon g JOIN FETCH g.brand WHERE g.user.id = :userId")
    Page<Gifticon> findByUserId(Long userId, Pageable pageable);

    Page<Gifticon> findByUserIdAndStatus(Long userId, GifticonStatus status, Pageable pageable);
}
