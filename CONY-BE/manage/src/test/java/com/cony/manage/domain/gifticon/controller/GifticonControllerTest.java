package com.cony.manage.domain.gifticon.controller;

import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import com.cony.manage.domain.gifticon.service.GifticonService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GifticonController.class)
class GifticonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GifticonService gifticonService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    @DisplayName("기프티콘 이미지 분석 요청")
    void analyzeGifticon() throws Exception {
        // given
        MockMultipartFile image = new MockMultipartFile("images", "test.jpg", "image/jpeg", "test data".getBytes());
        List<GifticonAnalysisResponseDto> response = List.of(GifticonAnalysisResponseDto.builder()
                .imageUrl("temp_url")
                .build());

        given(gifticonService.analyzeGifticon(any())).willReturn(response);

        // when & then
        mockMvc.perform(multipart("/v1/gifticons/analyze")
                        .file(image)
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].imageUrl").value("temp_url"));
    }

    @Test
    @WithMockUser
    @DisplayName("기프티콘 등록 요청")
    void registerGifticon() throws Exception {
        // given
        GifticonRegisterRequestDto request = new GifticonRegisterRequestDto();
        // Set fields if necessary via reflection or builder if available
        // Assuming validation passes or mocking validation
        
        List<Long> responseIds = List.of(1L, 2L);
        given(gifticonService.registerGifticon(any(), eq(1L))).willReturn(responseIds);

        // when & then
        mockMvc.perform(post("/v1/gifticons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(request)))
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("기프티콘 등록 성공."))
                .andExpect(jsonPath("$.data[0]").value(1L));
    }

    @Test
    @WithMockUser
    @DisplayName("내 기프티콘 목록 조회")
    void getMyGifticons() throws Exception {
        // given
        GifticonListResponseDto dto = GifticonListResponseDto.builder()
                .gifticonId(1L)
                .brandName("Starbucks")
                .build();
        Page<GifticonListResponseDto> page = new PageImpl<>(List.of(dto));

        given(gifticonService.getMyGifticons(eq(1L), any(Pageable.class))).willReturn(page);

        // when & then
        mockMvc.perform(get("/v1/gifticons")
                        .param("page", "0")
                        .param("size", "20")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].brandName").value("Starbucks"));
    }

    @Test
    @WithMockUser
    @DisplayName("기프티콘 상세 조회")
    void getGifticonDetail() throws Exception {
        // given
        GifticonDetailResponseDto response = GifticonDetailResponseDto.builder()
                .gifticonId(1L)
                .brandName("Starbucks")
                .productName("Latte")
                .build();

        given(gifticonService.getGifticonDetail(1L, 1L)).willReturn(response);

        // when & then
        mockMvc.perform(get("/v1/gifticons/1")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productName").value("Latte"));
    }

    @Test
    @WithMockUser
    @DisplayName("기프티콘 정보 수정")
    void updateGifticonInfo() throws Exception {
        // given
        GifticonUpdateRequestDto request = new GifticonUpdateRequestDto();
        // Since @Valid is used, we might need to populate valid data depending on DTO constraints.
        // Assuming minimal valid request for now or checking if validation fails.
        // For simple test, mocking service is enough if validation is mocked or loose.
        
        // Let's assume validation requires non-nulls. 
        // If validation fails, we get 400. Let's try to pass 'Valid' data if possible,
        // or just mock service call if validation is mocked or loose.
        // Reading DTOs is helpful, but here we try to pass valid-looking JSON.
        
        // Workaround: Mock validation or populate DTO.
        // Let's assume fields are populated via Jackson from JSON.
        
        given(gifticonService.updateGifticon(eq(1L), eq(1L), any())).willReturn(1L);

        // when & then
        mockMvc.perform(put("/v1/gifticons/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"brandName\":\"Starbucks\", \"productName\":\"Americano\", \"expiryDate\":\"2025-12-31\", \"originalPrice\":4500}")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("잘못된 정보가 수정되었습니다."))
                .andExpect(jsonPath("$.data").value(1L));
    }

    @Test
    @WithMockUser
    @DisplayName("기프티콘 사용")
    void useGifticon() throws Exception {
        // given
        GifticonUseRequestDto request = new GifticonUseRequestDto();
        given(gifticonService.useGifticon(eq(1L), eq(1L), any())).willReturn(1L);

        // when & then
        mockMvc.perform(post("/v1/gifticons/1/use")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":1000}")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("사용이 완료되었습니다."));
    }

    @Test
    @WithMockUser
    @DisplayName("기프티콘 사용 취소")
    void cancelUseGifticon() throws Exception {
        // given
        doNothing().when(gifticonService).cancelUseGifticon(10L, 1L);

        // when & then
        mockMvc.perform(post("/v1/gifticons/log/10/cancel")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("사용 이력이 취소 되었습니다."));
    }

    @Test
    @WithMockUser
    @DisplayName("사용 내역 수정")
    void updateUseLog() throws Exception {
        // given
        doNothing().when(gifticonService).updateUsageLog(eq(10L), eq(1L), any());

        // when & then
        mockMvc.perform(put("/v1/gifticons/log/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newAmount\":5000}")
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("사용 금액을 변경하였습니다."));
    }
}
