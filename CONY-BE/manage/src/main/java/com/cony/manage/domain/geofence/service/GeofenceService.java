package com.cony.manage.domain.geofence.service;

import com.cony.manage.domain.geofence.dto.GeofenceDto;

public interface GeofenceService {
    public GeofenceDto.Response getNearbyStores(Long userId, GeofenceDto.Request request);

    /**
     * 지오펜스 진입 이벤트 처리
     * 
     * @param userId  사용자 ID
     * @param request 진입 이벤트 요청 정보 (지오펜스 ID 등)
     */
    void handleEntryEvent(Long userId, GeofenceDto.EntryRequest request);
}
