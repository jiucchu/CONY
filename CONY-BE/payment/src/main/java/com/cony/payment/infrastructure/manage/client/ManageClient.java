package com.cony.payment.infrastructure.manage.client;

import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.manage.config.ManageServerProperties;
import com.cony.payment.infrastructure.manage.dto.AutoSaleTargetResponse;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

/**
 * Manage 서버 API 호출 클라이언트
 * - 기프티콘 정보 조회
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ManageClient {

    private final RestTemplate restTemplate;
    private final ManageServerProperties manageServerProperties;

    /**
     * 기프티콘 상세 정보 조회
     * @param gifticonId 기프티콘 ID
     * @return 기프티콘 정보
     */
    public GifticonResponse getGifticon(Long gifticonId) {
        String url = manageServerProperties.getGifticonUrl(gifticonId);
        log.info("Manage 서버 기프티콘 조회 요청: gifticonId={}, url={}", gifticonId, url);

        try {
            ResponseEntity<ApiResponse<GifticonResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<GifticonResponse>>() {}
            );

            if (response.getBody() != null && response.getBody().getData() != null) {
                log.info("Manage 서버 기프티콘 조회 성공: gifticonId={}", gifticonId);
                return response.getBody().getData();
            }

            throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);

        } catch (HttpClientErrorException.NotFound e) {
            log.warn("기프티콘을 찾을 수 없음: gifticonId={}", gifticonId);
            throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);

        } catch (HttpClientErrorException e) {
            log.error("Manage 서버 호출 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            log.error("Manage 서버 통신 오류: gifticonId={}", gifticonId, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 기프티콘 존재 여부 확인
     * @param gifticonId 기프티콘 ID
     * @return 존재 여부
     */
    public boolean existsGifticon(Long gifticonId) {
        try {
            getGifticon(gifticonId);
            return true;
        } catch (CustomException e) {
            if (e.getErrorCode() == ErrorCode.GIFTICON_NOT_FOUND) {
                return false;
            }
            throw e;
        }
    }

    /**
     * 기프티콘 다건 조회 (ID 목록으로)
     * @param gifticonIds 기프티콘 ID 목록
     * @return 기프티콘 정보 맵 (gifticonId -> GifticonResponse)
     */
    public java.util.Map<Long, GifticonResponse> getGifticons(java.util.List<Long> gifticonIds) {
        if (gifticonIds == null || gifticonIds.isEmpty()) {
            return java.util.Collections.emptyMap();
        }

        java.util.Map<Long, GifticonResponse> result = new java.util.HashMap<>();

        // TODO: 배치 API가 생기면 한 번에 조회하도록 변경
        for (Long gifticonId : gifticonIds) {
            try {
                GifticonResponse gifticon = getGifticon(gifticonId);
                result.put(gifticonId, gifticon);
            } catch (CustomException e) {
                log.warn("기프티콘 조회 실패: gifticonId={}", gifticonId);
                // 실패한 건은 스킵
            }
        }

        return result;
    }

    /**
     * 시스템 제안 대상 기프티콘 조회 (알림 필요)
     * - 유효기간 1달 이내인데 자동판매 미설정된 기프티콘
     * @return 시스템 제안 대상 기프티콘 목록
     */
    public List<AutoSaleTargetResponse> getAutoSaleTargetsWithNotification() {
        String url = manageServerProperties.getUrl() + "/v1/gifticons/auto-sale/with-notification";
        log.info("Manage 서버 시스템 제안 대상 조회 (알림 필요): url={}", url);

        try {
            ResponseEntity<ApiResponse<List<AutoSaleTargetResponse>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<List<AutoSaleTargetResponse>>>() {}
            );

            if (response.getBody() != null && response.getBody().getData() != null) {
                log.info("시스템 제안 대상 조회 성공 (알림 필요): count={}", response.getBody().getData().size());
                return response.getBody().getData();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("시스템 제안 대상 조회 실패 (알림 필요)", e);
            return Collections.emptyList();
        }
    }

    /**
     * 자동판매 대상 기프티콘 조회 (알림 불필요 - 바로 판매 등록)
     * - 사용자가 직접 자동판매 설정한 기프티콘 (판매일 도래)
     * @return 자동판매 대상 기프티콘 목록
     */
    public List<AutoSaleTargetResponse> getAutoSaleTargetsWithoutNotification() {
        String url = manageServerProperties.getUrl() + "/v1/gifticons/auto-sale/without-notification";
        log.info("Manage 서버 자동판매 대상 조회 (알림 불필요): url={}", url);

        try {
            ResponseEntity<ApiResponse<List<AutoSaleTargetResponse>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<List<AutoSaleTargetResponse>>>() {}
            );

            if (response.getBody() != null && response.getBody().getData() != null) {
                log.info("자동판매 대상 조회 성공 (알림 불필요): count={}", response.getBody().getData().size());
                return response.getBody().getData();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("자동판매 대상 조회 실패 (알림 불필요)", e);
            return Collections.emptyList();
        }
    }

    /**
     * 자동판매 처리 완료 표시
     * - 판매 등록 완료 후 Manage 서버의 자동판매 설정 초기화
     * @param gifticonId 기프티콘 ID
     */
    public void markAutoSaleProcessed(Long gifticonId) {
        String url = manageServerProperties.getUrl() + "/v1/gifticons/" + gifticonId + "/auto-sale/processed";
        log.info("Manage 서버 자동판매 처리 완료 표시: gifticonId={}, url={}", gifticonId, url);

        try {
            restTemplate.postForEntity(url, null, ApiResponse.class);
            log.info("자동판매 처리 완료 표시 성공: gifticonId={}", gifticonId);

        } catch (Exception e) {
            log.error("자동판매 처리 완료 표시 실패: gifticonId={}", gifticonId, e);
        }
    }
}
