package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GifticonRepository extends JpaRepository<Gifticon, Long> {
}
