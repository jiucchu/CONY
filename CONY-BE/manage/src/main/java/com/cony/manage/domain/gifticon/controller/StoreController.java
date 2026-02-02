package com.cony.manage.domain.gifticon.controller;

import com.cony.manage.domain.gifticon.controller.docs.StoreControllerDocs;
import com.cony.manage.domain.gifticon.dto.NearbyBrandIdsResponse;
import com.cony.manage.domain.gifticon.service.StoreGeoService;
import com.cony.manage.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/v1/stores")
@RequiredArgsConstructor
public class StoreController implements StoreControllerDocs {
    private final StoreGeoService storeService;

    @Override
    @GetMapping("/nearby")
    public ApiResponse<NearbyBrandIdsResponse> getNearbyStoreIds(double latitude, double longitude, Long userId) {

        return ApiResponse.success("근처 브랜드 정보 반환", storeService.getNearbyBrandIdsByZones(latitude, longitude));
    }
}
