package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GifticonRepository extends JpaRepository<Gifticon, Long> {
    boolean existsByBarcodeNumber(String barcodeNumber);

    // 내 기프티콘 목록 페이징 조회
    // N+1 문제 방지를 위한 fetch join 사용
    // batch size 를 사용하기 때문에 fetch join 제거.
    Page<Gifticon> findByUserId(Long userId, Pageable pageable);

    Page<Gifticon> findByUserIdAndStatus(Long userId, GifticonStatus status, Pageable pageable);

    @Query("SELECT DISTINCT g.brand.id as id, g.brand.name as name, g.brand.iconUrl as iconUrl FROM Gifticon g WHERE g.user.id = :userId AND g.status <> :excludeStatus")
    List<BrandProjection> findDistinctBrandsByUserId(@Param("userId") Long userId, @Param("excludeStatus") GifticonStatus excludeStatus);

}
