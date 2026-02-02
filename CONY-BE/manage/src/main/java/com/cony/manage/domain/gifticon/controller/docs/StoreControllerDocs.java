package com.cony.manage.domain.gifticon.controller.docs;

import com.cony.manage.domain.gifticon.dto.NearbyBrandIdsResponse;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.web.bind.annotation.RequestParam;

public interface StoreControllerDocs {

    @Operation(summary = "근처 브랜드 목록", description = "근처 보유중인 브랜드 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "브랜드 목록 반환")
    })
    ApiResponse<NearbyBrandIdsResponse> getNearbyStoreIds(@RequestParam double latitude, @RequestParam double longitude, @AuthUser Long userId);
}
