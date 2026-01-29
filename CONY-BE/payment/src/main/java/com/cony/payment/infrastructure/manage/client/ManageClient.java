package com.cony.payment.infrastructure.manage.client;

import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.manage.config.ManageServerProperties;
import com.cony.payment.infrastructure.manage.dto.GifticonListItemResponse;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import com.cony.payment.infrastructure.manage.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
     * 나의 기프티콘 목록 조회
     * 만료일이 가까운 순서로 정렬 및 조회
     * @param size 조회할 목록의 개수 (추천 리스트의 limit)
     * @return 기프티콘 요약 정보 목록
     */
    public List<GifticonListItemResponse> getMyGifticons(int size) {
        // Todo: 거리순 정렬 추가
        String url = manageServerProperties.getGifticonListUrl()
                + "?page=0&size=" + size + "&sort=expiryDate,asc";
        log.info("Manage 서버 기프티콘 목록 조회 요청: url={}", url);

        try {
            ResponseEntity<ApiResponse<PageResponse<GifticonListItemResponse>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<PageResponse<GifticonListItemResponse>>>() {}
            );

            if (response.getBody() != null && response.getBody().getData() != null) {
                PageResponse<GifticonListItemResponse> data = response.getBody().getData();
                if (data != null && data.getContent() != null) {
                    log.info("Manage 서버 기프티콘 목록 조회 성공: size={}", data.getContent().size());
                    return data.getContent();
                }
            }

            throw new CustomException(ErrorCode.MANAGE_SERVER_ERROR);

        } catch (Exception e) {
            log.error("Manage 서버 목록 통신 오류", e);
            throw new CustomException(ErrorCode.MANAGE_SERVER_ERROR);
        }
    }
}
