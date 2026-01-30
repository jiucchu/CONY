package com.cony.payment.domain.point.controller.docs;

import com.cony.payment.domain.point.dto.PointResponse;
import com.cony.payment.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Point", description = "포인트 관리 API")
public interface PointControllerDocs {

    @Operation(summary = "포인트 잔액 조회", description = "현재 사용자의 포인트 잔액을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<PointResponse> getPointBalance();
}
