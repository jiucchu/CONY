package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.GifticonAnalysisResponseDto;
import com.cony.manage.domain.gifticon.dto.OcrRequestDto;
import com.cony.manage.infrastructure.image.FileUploader;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@SpringBootTest
public class OcrIntegrationTest {

    @Autowired
    private GifticonService gifticonService;

    @Autowired
    private ObjectMapper objectMapper; // JSON 변환기 (Spring 기본 Bean)

    @MockBean
    private FileUploader fileUploader; // 파일 업로드는 흉내만 냄 (실제 파일 저장 X)

    @Test
    @DisplayName("1. [데이터 포맷 검증] DTO가 스네이크 케이스(image_url)로 잘 변환되는지 확인")
    void checkJsonFormat() throws Exception {
        // given
        OcrRequestDto requestDto = OcrRequestDto.builder()
                .imageUrl("http://example.com/image.jpg")
                .imageType("ORIGINAL")
                .build();

        // when
        String jsonString = objectMapper.writeValueAsString(requestDto);

        // then
        System.out.println("=== 생성된 JSON 확인 ===");
        System.out.println(jsonString);
        System.out.println("======================");

        // ★ 핵심: "imageUrl"이 아니라 "image_url"로 변환되었는지 확인
        assertThat(jsonString).contains("\"image_url\"");
        assertThat(jsonString).contains("\"image_type\"");
        assertThat(jsonString).doesNotContain("\"imageUrl\""); // 카멜 케이스는 없어야 함
    }

    @Test
    @DisplayName("2. [실제 서버 통신] 로컬 AI 서버에 요청을 보내고 응답을 받는지 확인")
    void testRealConnectionToAiServer() throws Exception {
        // 주의: 이 테스트는 로컬에 Python AI 서버(uvicorn)가 켜져 있어야 성공합니다.

        // given
        // 테스트용 가짜 파일 생성
        MockMultipartFile mockFile = new MockMultipartFile(
                "images", "test.jpg", "image/jpeg", "fake-image-content".getBytes());

        // 파일 업로더는 단순히 로컬 URL을 리턴하도록 모킹 (AI 서버가 접근 가능한 URL이어야 함)
        // ★ 실제 테스트를 위해선, 프로젝트 내에 있는 진짜 이미지 경로를 주거나
        // 웹에서 접근 가능한 외부 이미지 URL(예: 구글 로고 등)을 잠시 넣어서 테스트하는 게 좋습니다.
        String testImageUrl = "https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/eng.traineddata"; // 혹은 실제
                                                                                                               // 동작하는
                                                                                                               // 이미지
                                                                                                               // URL
        // 만약 로컬 서버 설정을 마쳤다면 아래처럼 실제 업로드 경로를 리턴해도 됩니다.
        // String testImageUrl = "http://localhost:8080/uploads/temp/test.jpg";

        given(fileUploader.upload(any(MultipartFile.class), eq(null))).willReturn(testImageUrl);

        // when
        System.out.println(">>> AI 서버로 요청을 보냅니다... URL: " + testImageUrl);
        List<GifticonAnalysisResponseDto> results = gifticonService.analyzeGifticon(List.of(mockFile));

        // then
        System.out.println(">>> AI 서버 응답 수신 완료!");
        assertThat(results).isNotEmpty();

        GifticonAnalysisResponseDto result = results.get(0);
        System.out.println("분석된 브랜드명: " + result.getFields().getBrandName());
        System.out.println("분석된 상품명: " + result.getFields().getProductName());

        // needsReview가 비어있다면 성공적으로 분석된 것
        // (실패 시 Service 로직에 의해 needsReview에 모든 필드가 들어감)
        if (!result.getNeedsReview().isEmpty()) {
            System.out.println("⚠️ 분석 실패 (혹은 검토 필요): " + result.getNeedsReview());
        } else {
            System.out.println("✅ 분석 성공!");
        }
    }
}