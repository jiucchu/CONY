package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.GifticonUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GifticonUsageLogRepository extends JpaRepository<GifticonUsageLog, Long> {
    Optional<GifticonUsageLog> findByGifticonIdAndIsCanceledFalse(Long gifticonId);
    List<GifticonUsageLog> findByGifticonIdAndIsCanceledFalseOrderByCreatedAtDesc(Long gifticonId);
}
