package com.cony.payment.domain.report.service;

import com.cony.payment.domain.report.dto.ReportRequestDto;
import com.cony.payment.domain.report.entity.Report;
import com.cony.payment.domain.report.repository.ReportRepository;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ReportServiceTest {

    @Autowired ReportService reportService;
    @Autowired UserRepository userRepository;
    @Autowired SaleService saleService;
    @Autowired ReportRepository reportRepository;

    @Test
    @DisplayName("1차 신고 승인 시: 유저는 7일간 정지(SUSPENDED) 되어야 한다.")
    void firstSuspensionTest() {
        // given
        User seller = createUser("seller@test.com", "사기꾼");
        User reporter = createUser("police@test.com", "경찰");
        Long saleId = createSale(seller);

        // 신고 요청 DTO 생성 (setter가 없으므로 리플렉션이나 테스트용 생성자 필요하지만, 여기선 필드 주입 가정)
        // 만약 DTO에 생성자가 없다면 DTO에 @AllArgsConstructor 추가하거나 테스트용 생성자 사용
        ReportRequestDto request = new ReportRequestDto();
        // (테스트 편의를 위해 DTO에 리플렉션으로 값 세팅한다고 가정하거나, DTO를 수정해서 생성자 추가 추천)
        // 여기서는 DTO 수정이 번거로우니, Service 로직 테스트를 위해 DTO 생성 방식을 적절히 처리해야 합니다.
        // ** 팁: ReportRequestDto에 @AllArgsConstructor를 붙이거나 아래처럼 리플렉션 사용 **
        setDtoField(request, "saleId", saleId);
        setDtoField(request, "reason", "사기입니다");

        // when
        Long reportId = reportService.createReport(reporter.getId(), request);
        reportService.approveReport(reportId); // 관리자 승인

        // then
        User bannedUser = userRepository.findById(seller.getId()).orElseThrow();

        assertThat(bannedUser.getReportCount()).isEqualTo(1); // 카운트 1
        assertThat(bannedUser.getStatus()).isEqualTo(UserStatus.SUSPENDED); // 상태 정지
        assertThat(bannedUser.getSuspensionEndAt()).isAfter(LocalDateTime.now().plusDays(6)); // 7일 뒤인지 체크
    }

    @Test
    @DisplayName("2차 신고 승인 시: 유저는 영구 정지(BANNED) 되어야 한다.")
    void secondBanTest() {
        // given
        User seller = createUser("badguy@test.com", "상습범");
        User reporter1 = createUser("victim1@test.com", "피해자1");
        User reporter2 = createUser("victim2@test.com", "피해자2");

        Long saleId = createSale(seller);

        // 1. 첫 번째 신고 및 승인 (1스택 적립)
        ReportRequestDto req1 = new ReportRequestDto();
        setDtoField(req1, "saleId", saleId);
        setDtoField(req1, "reason", "가짜에요");
        Long reportId1 = reportService.createReport(reporter1.getId(), req1);
        reportService.approveReport(reportId1);

        // 2. 두 번째 신고 및 승인 (다른 사람이 신고)
        ReportRequestDto req2 = new ReportRequestDto();
        setDtoField(req2, "saleId", saleId);
        setDtoField(req2, "reason", "저도 당했어요");
        Long reportId2 = reportService.createReport(reporter2.getId(), req2);

        // when (두 번째 승인)
        reportService.approveReport(reportId2);

        // then
        User bannedUser = userRepository.findById(seller.getId()).orElseThrow();

        assertThat(bannedUser.getReportCount()).isEqualTo(2); // 카운트 2
        assertThat(bannedUser.getStatus()).isEqualTo(UserStatus.BANNED); // 영구 정지
        assertThat(bannedUser.getSuspensionEndAt()).isNull(); // 날짜 없음 (무기한)
    }

    @Test
    @DisplayName("중복 신고 방지: 같은 사람이 같은 글을 또 신고하면 예외 발생")
    void duplicateReportTest() {
        // given
        User seller = createUser("s@t.com", "판매자");
        User reporter = createUser("r@t.com", "신고자");
        Long saleId = createSale(seller);

        ReportRequestDto request = new ReportRequestDto();
        setDtoField(request, "saleId", saleId);
        setDtoField(request, "reason", "중복신고테스트");

        // 1회 신고
        reportService.createReport(reporter.getId(), request);

        // when & then
        assertThatThrownBy(() -> reportService.createReport(reporter.getId(), request))
                .isInstanceOf(CustomException.class)
                .hasMessage("이미 신고한 판매글입니다.");
    }

    // === 테스트용 헬퍼 메서드 ===

    private User createUser(String email, String name) {
        User user = User.builder()
                .email(email)
                .name(name)
                .oauthProvider(OAuthProvider.KAKAO)
                .build();
        return userRepository.save(user);
    }

    private Long createSale(User seller) {
        SaleRequestDto request = new SaleRequestDto(123L, 5000L, 4500L); // DTO 생성자 필요
        return saleService.createSale(seller.getId(), request);
    }

    // DTO에 Setter가 없을 때 강제로 값 넣기 위한 메서드 (Reflection)
    private void setDtoField(Object object, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(object, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}