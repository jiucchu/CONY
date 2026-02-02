package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.domain.gifticon.entity.*;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import com.cony.manage.domain.gifticon.enums.ImageType;
import com.cony.manage.domain.gifticon.repository.*;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.infrastructure.image.FileUploader;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GifticonServiceImplTest {

    @InjectMocks
    private GifticonServiceImpl gifticonService;

    @Mock
    private GifticonRepository gifticonRepository;
    @Mock
    private GifticonImageRepository gifticonImageRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private GifticonUsageLogRepository gifticonUsageLogRepository;
    @Mock
    private FileUploader fileUploader;

    private User createUser(Long id) {
        User user = org.mockito.Mockito.mock(User.class);
        org.mockito.Mockito.lenient().when(user.getId()).thenReturn(id);
        return user;
    }

    private Brand createBrand(Category category) {
        return Brand.builder()
                .id(1)
                .name("Starbucks")
                .category(category)
                .build();
    }

    private Category createCategory() {
        return Category.builder()
                .id(1)
                .name("Coffee")
                .build();
    }

    private Gifticon createGifticon(User user, Brand brand, Category category) {
        Gifticon gifticon = Gifticon.builder()
                .user(user)
                .brand(brand)
                .category(category)
                .productName("Americano")
                .barcodeNumber("123456789012")
                .gifticonType(GifticonType.PRODUCT)
                .originalPrice(4500)
                .currentBalance(4500)
                .expiryDate(LocalDate.now().plusDays(30))
                .status(GifticonStatus.NOT_USED)
                .build();
        ReflectionTestUtils.setField(gifticon, "id", 1L);
        return gifticon;
    }

    @Test
    @DisplayName("기프티콘 등록 성공")
    void registerGifticon_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);

        GifticonRegisterRequestDto request = new GifticonRegisterRequestDto();
        ReflectionTestUtils.setField(request, "brandName", "스타벅스");
        ReflectionTestUtils.setField(request, "productName", "Americano");
        ReflectionTestUtils.setField(request, "barcodeNumber", "123456789012");
        ReflectionTestUtils.setField(request, "expiryDate", LocalDate.now().plusDays(30));
        ReflectionTestUtils.setField(request, "type", GifticonType.PRODUCT);
        ReflectionTestUtils.setField(request, "originalPrice", 4500);
        ReflectionTestUtils.setField(request, "imageUrl", "temp/image.jpg");

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(gifticonRepository.existsByBarcodeNumber(any())).willReturn(false);
        given(fileUploader.copyToPermanent(any(), anyLong())).willReturn("permanent/image.jpg");
        given(brandRepository.findByName(any())).willReturn(Optional.of(brand));
        given(gifticonRepository.save(any(Gifticon.class))).willAnswer(invocation -> {
            Gifticon g = invocation.getArgument(0);
            ReflectionTestUtils.setField(g, "id", 1L);
            return g;
        });

        // when
        List<Long> result = gifticonService.registerGifticon(List.of(request), userId, null, null);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(1L);
        verify(gifticonRepository, times(1)).save(any(Gifticon.class));
        verify(gifticonImageRepository, times(1)).save(any(GifticonImage.class));
    }

    @Test
    @DisplayName("기프티콘 등록 실패 - 중복된 바코드")
    void registerGifticon_Fail_Duplicate() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        GifticonRegisterRequestDto request = new GifticonRegisterRequestDto();
        ReflectionTestUtils.setField(request, "barcodeNumber", "123456789012");

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(gifticonRepository.existsByBarcodeNumber(any())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> gifticonService.registerGifticon(List.of(request), userId, null, null))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_GIFTICON);
    }

    @Test
    @DisplayName("나의 기프티콘 목록 조회")
    void getMyGifticons_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Gifticon> gifticonPage = new PageImpl<>(List.of(gifticon), pageable, 1);

        given(gifticonRepository.findByUserId(userId, pageable)).willReturn(gifticonPage);
        given(gifticonImageRepository.findAllByGifticonIdIn(any(), any())).willReturn(List.of(
                GifticonImage.builder()
                        .gifticon(gifticon)
                        .imageUrl("image.jpg")
                        .imageType(ImageType.THUMBNAIL)
                        .build()));

        // when
        Page<GifticonListResponseDto> result = gifticonService.getMyGifticons(userId, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getBrandName()).isEqualTo("Starbucks");
    }

    @Test
    @DisplayName("기프티콘 상세 조회 성공")
    void getGifticonDetail_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);

        given(gifticonRepository.findById(1L)).willReturn(Optional.of(gifticon));
        given(gifticonImageRepository.findByGifticonIdAndImageType(1L, ImageType.ORIGINAL))
                .willReturn(Optional.of(GifticonImage.builder().imageUrl("original.jpg").build()));

        // when
        GifticonDetailResponseDto result = gifticonService.getGifticonDetail(1L, userId);

        // then
        assertThat(result.getGifticonId()).isEqualTo(1L);
        assertThat(result.getBrandName()).isEqualTo("Starbucks");
        assertThat(result.getImageUrl()).isEqualTo("original.jpg");
    }

    @Test
    @DisplayName("기프티콘 사용 성공 - 금액권 전액 사용")
    void useGifticon_Prepaid_FullUse_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);
        // Change to Prepaid
        ReflectionTestUtils.setField(gifticon, "gifticonType", GifticonType.PREPAID);
        ReflectionTestUtils.setField(gifticon, "originalPrice", 10000);
        ReflectionTestUtils.setField(gifticon, "currentBalance", 10000);

        GifticonUseRequestDto request = new GifticonUseRequestDto();
        ReflectionTestUtils.setField(request, "amount", 10000);

        given(gifticonRepository.findById(1L)).willReturn(Optional.of(gifticon));

        // when
        Long resultId = gifticonService.useGifticon(1L, userId, request);

        // then
        assertThat(resultId).isEqualTo(1L);
        assertThat(gifticon.getCurrentBalance()).isEqualTo(0);
        assertThat(gifticon.getStatus()).isEqualTo(GifticonStatus.USED);
    }

    @Test
    @DisplayName("기프티콘 사용 성공 - 금액권")
    void useGifticon_Prepaid_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);
        // Change to Prepaid
        ReflectionTestUtils.setField(gifticon, "gifticonType", GifticonType.PREPAID);
        ReflectionTestUtils.setField(gifticon, "originalPrice", 10000);
        ReflectionTestUtils.setField(gifticon, "currentBalance", 10000);

        GifticonUseRequestDto request = new GifticonUseRequestDto();
        ReflectionTestUtils.setField(request, "amount", 2000);

        given(gifticonRepository.findById(1L)).willReturn(Optional.of(gifticon));

        // when
        Long resultId = gifticonService.useGifticon(1L, userId, request);

        // then
        assertThat(resultId).isEqualTo(1L);
        assertThat(gifticon.getCurrentBalance()).isEqualTo(8000);
        assertThat(gifticon.getStatus()).isEqualTo(GifticonStatus.IN_USE);
    }

    @Test
    @DisplayName("기프티콘 사용 취소 성공")
    void cancelUseGifticon_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);

        // Use normal numbers (outside cache) to verify object equality fix
        ReflectionTestUtils.setField(gifticon, "originalPrice", 4500);
        ReflectionTestUtils.setField(gifticon, "currentBalance", 0);
        ReflectionTestUtils.setField(gifticon, "status", GifticonStatus.USED);

        GifticonUsageLog log = GifticonUsageLog.builder()
                .gifticon(gifticon)
                .usedAmount(4500)
                .balanceAfterUse(0)
                .build();
        ReflectionTestUtils.setField(log, "id", 100L);

        given(gifticonUsageLogRepository.findById(100L)).willReturn(Optional.of(log));

        // when
        gifticonService.cancelUseGifticon(100L, userId, false);

        // then
        assertThat(log.isCanceled()).isTrue();
        assertThat(gifticon.getCurrentBalance()).isEqualTo(4500);
        assertThat(gifticon.getStatus()).isEqualTo(GifticonStatus.NOT_USED);
    }

    @Test
    @DisplayName("기프티콘 이미지 분석 (Mock)")
    void analyzeGifticon_Success() {
        // given
        MultipartFile image = org.mockito.Mockito.mock(MultipartFile.class);
        given(fileUploader.upload(any(), any())).willReturn("temp_url");

        // when
        List<GifticonAnalysisResponseDto> result = gifticonService.analyzeGifticon(List.of(image));

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getImageUrl()).isEqualTo("temp_url");
    }

    @Test
    @DisplayName("기프티콘 정보 수정 성공")
    void updateGifticon_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);

        GifticonUpdateRequestDto request = new GifticonUpdateRequestDto();
        ReflectionTestUtils.setField(request, "brandName", "Starbucks");
        ReflectionTestUtils.setField(request, "productName", "Latte");
        ReflectionTestUtils.setField(request, "expiryDate", LocalDate.now().plusDays(60));
        ReflectionTestUtils.setField(request, "originalPrice", 5000);

        given(gifticonRepository.findById(1L)).willReturn(Optional.of(gifticon));
        given(brandRepository.findByName("Starbucks")).willReturn(Optional.of(brand));

        // when
        Long resultId = gifticonService.updateGifticon(1L, userId, request, null, null);

        // then
        assertThat(resultId).isEqualTo(1L);
        assertThat(gifticon.getProductName()).isEqualTo("Latte");
        assertThat(gifticon.getOriginalPrice()).isEqualTo(5000);
    }

    @Test
    @DisplayName("기프티콘 사용 내역 수정 성공")
    void updateUsageLog_Success() {
        // given
        Long userId = 1L;
        User user = createUser(userId);
        Category category = createCategory();
        Brand brand = createBrand(category);
        Gifticon gifticon = createGifticon(user, brand, category);
        // Use larger numbers
        ReflectionTestUtils.setField(gifticon, "originalPrice", 10000);
        ReflectionTestUtils.setField(gifticon, "currentBalance", 5000);
        ReflectionTestUtils.setField(gifticon, "status", GifticonStatus.IN_USE);

        GifticonUsageLog log = GifticonUsageLog.builder()
                .gifticon(gifticon)
                .usedAmount(5000)
                .balanceAfterUse(5000)
                .build();
        ReflectionTestUtils.setField(log, "id", 100L);

        GifticonLogUpdateRequestDto request = new GifticonLogUpdateRequestDto();
        ReflectionTestUtils.setField(request, "newAmount", 4000); // 5000 -> 4000 used. Balance should recover 1000 ->
                                                                  // 6000.

        given(gifticonUsageLogRepository.findById(100L)).willReturn(Optional.of(log));

        // when
        gifticonService.updateUsageLog(100L, userId, request);

        // then
        assertThat(log.getUsedAmount()).isEqualTo(4000);
        assertThat(log.getBalanceAfterUse()).isEqualTo(6000);
        assertThat(gifticon.getCurrentBalance()).isEqualTo(6000);
    }
}