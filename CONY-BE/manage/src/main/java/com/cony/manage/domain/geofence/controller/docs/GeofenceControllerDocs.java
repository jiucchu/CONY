package com.cony.manage.domain.geofence.controller.docs;

import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Geofence API", description = "위치 기반 매장 검색 및 지오펜싱")
public interface GeofenceControllerDocs {
    @Operation(summary = "주변 매장 조회", description = "현재 위치 기준 반경 N미터 내의 매장(또는 클러스터) 정보를 반환합니다.")
    ApiResponse<GeofenceDto.Response> getNearbyStores(Long userId, GeofenceDto.Request request);
}
