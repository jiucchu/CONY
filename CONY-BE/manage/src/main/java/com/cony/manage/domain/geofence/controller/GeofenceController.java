package com.cony.manage.domain.geofence.controller;

import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.domain.geofence.service.GeofenceService;
import com.cony.manage.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/geofence")
@RequiredArgsConstructor
public class GeofenceController {

    private final GeofenceService geofenceService;

    @PostMapping("/refresh")
    public ApiResponse<GeofenceDto.Response> refreshGeofence(@RequestBody GeofenceDto.Request request) {
        // 필요시 Validation (위경도 범위 등)
        GeofenceDto.Response response = geofenceService.getNearbyStores(request);
        return ApiResponse.success(response);
    }
}