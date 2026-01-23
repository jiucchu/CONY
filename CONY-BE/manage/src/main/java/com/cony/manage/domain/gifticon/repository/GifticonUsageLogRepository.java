package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.GifticonUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GifticonUsageLogRepository extends JpaRepository<GifticonUsageLog, Long> {
    List<GifticonUsageLog> findByGifticonIdAndIsCanceledFalseOrderByCreatedAtDesc(Long gifticonId);
}
