package com.cony.payment.domain.report.controller.docs;

import com.cony.payment.domain.report.dto.ReportRequestDto;
import com.cony.payment.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Report", description = "신고 관리 API")
public interface ReportControllerDocs {

    @Operation(summary = "신고 접수", description = "판매글을 신고합니다. 동일 판매글에 대한 중복 신고는 불가능합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "신고 접수 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "이미 신고함 / 본인 판매글 신고 불가", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "판매글을 찾을 수 없음", content = @Content)
    })
    ApiResponse<Long> createReport(
            @RequestBody ReportRequestDto request
    );

    @Operation(summary = "신고 승인 (관리자)", description = "신고를 승인하고 자동 처벌을 적용합니다. 1차: 7일 정지, 2차 이상: 영구 정지")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "승인 및 처벌 적용 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "이미 처리된 신고", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "신고를 찾을 수 없음", content = @Content)
    })
    ApiResponse<Void> approveReport(
            @Parameter(description = "신고 ID", required = true) @PathVariable Long reportId
    );
}
