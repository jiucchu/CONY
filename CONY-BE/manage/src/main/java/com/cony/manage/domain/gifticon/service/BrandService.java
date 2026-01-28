package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.BrandResponseDto;

import java.util.List;

public interface BrandService {
    List<BrandResponseDto> getList(Long userId);
}
