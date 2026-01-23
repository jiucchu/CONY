package com.cony.manage.global.controller;

import com.cony.manage.global.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {
    @GetMapping("/health-check")
    public ApiResponse<String> healthCheck() {
        return ApiResponse.success("Server is ON!", "CONY Manage Server is running...");
    }
}
