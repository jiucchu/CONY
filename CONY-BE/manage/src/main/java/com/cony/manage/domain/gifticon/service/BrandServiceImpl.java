package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.BrandResponseDto;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final GifticonRepository gifticonRepository;

    @Override
    public List<BrandResponseDto> getList(Long userId) {
        return gifticonRepository.findDistinctBrandsByUserId(userId, GifticonStatus.USED).stream()
                .map(BrandResponseDto::toDto)
                .toList();
    }
}
