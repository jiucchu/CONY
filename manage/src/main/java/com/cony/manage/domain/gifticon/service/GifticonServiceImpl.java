package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GifticonServiceImpl implements GifticonService {
    private final GifticonRepository gifticonRepository;


}
