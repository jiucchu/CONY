package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.GifticonImage;
import com.cony.manage.domain.gifticon.enums.ImageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GifticonImageRepository extends JpaRepository<GifticonImage, Long> {
    // gifticonId와 imageType을 이용해 이미지 조회 (썸네일 혹은 오리지널 이미지를 불러옴)
    @Query("SELECT i FROM GifticonImage i WHERE i.gifticon.id = :gifticonId AND i.imageType = :imageType")
    Optional<GifticonImage> findByGifticonIdAndImageType(Long gifticonId, ImageType imageType);

    @Query("SELECT i FROM GifticonImage i WHERE i.gifticon.id IN :gifticonIds AND i.imageType = :imageType")
    List<GifticonImage> findAllByGifticonIdIn(List<Long> gifticonIds, ImageType imageType);
}
