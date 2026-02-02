package com.cony.manage.domain.geofence.controller;

import com.cony.manage.domain.geofence.controller.docs.GeofenceControllerDocs;
import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.domain.geofence.service.GeofenceService;
import com.cony.manage.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/geofence")
@RequiredArgsConstructor
public class GeofenceController implements GeofenceControllerDocs {
    private final GeofenceService geofenceService;

    @Override
    @PostMapping("/nearby")
    public ApiResponse<GeofenceDto.Response> getNearbyStores(@Valid @RequestBody GeofenceDto.Request request) {

        // 1. 로그: 요청 들어온 좌표 확인 (디버깅용)
        log.info(">>>> Geofence Request: lat={}, lon={}, radius={}", request.getLat(), request.getLon(),
                request.getRadius());

        // 2. 서비스 호출 (Redis 조회 + 클러스터링 로직)
        GeofenceDto.Response response = geofenceService.getNearbyStores(request);

        // 3. 응답 반환
        return ApiResponse.success(response);
    }

    /**
     * 지오펜스 진입 이벤트 처리
     * 클라이언트(앱)에서 지오펜스 진입 시 호출
     */
    @PostMapping("/entry")
    public ApiResponse<Void> handleEntryEvent(
            @com.cony.manage.global.auth.annotation.AuthUser Long userId,
            @RequestBody @Valid GeofenceDto.EntryRequest request) {

        log.info(">>>> Geofence Entry Event: user={}, geofenceId={}, lat={}, lon={}",
                userId, request.getGeofenceId(), request.getLat(), request.getLon());

        geofenceService.handleEntryEvent(userId, request);
        return ApiResponse.success("이벤트가 정상적으로 수신되었습니다.");
    }
}