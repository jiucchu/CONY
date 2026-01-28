package com.cony.payment.infrastructure.manage.client;

import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.manage.config.ManageServerProperties;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

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
}
