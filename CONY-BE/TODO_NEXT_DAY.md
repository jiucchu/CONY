# 내일(Next Day) 작업 계획: Payment & Manage 서버 기능 고도화

## 1. 🚨 긴급: 사용자 정지 동기화 및 로그인 제한 (Manage 서버)
**문제점:** Payment 서버에서 유저를 정지시켜도 Manage 서버에는 상태 정보가 없어 로그인이 차단되지 않음.
**작업 내용:**
1.  **[Manage] User 엔티티 수정**: `UserStatus` (ACTIVE, SUSPENDED, BANNED) 및 `reportCount` 필드 추가. (Payment 서버의 User 엔티티와 싱크 맞추기)
2.  **[Manage] 로그인 핸들러 수정**: `OAuth2LoginSuccessHandler`에서 로그인 시 `UserStatus`를 검사하여 차단된 유저의 로그인 막기.

## 2. 🛡️ 신고 기능 완성도 향상 (Payment 서버)
**문제점:** 신고가 승인되어도 해당 판매글(Sale)이 여전히 판매 중 상태로 남아 있음.
**작업 내용:**
1.  **[Payment] ReportService 수정**: `approveReport` 메서드에서 신고 승인 시, 해당 `Sale`의 상태를 `SUSPENDED` (또는 목록에서 숨김 처리될 상태)로 변경.
2.  **[Payment] 관리자 권한 체크**: 신고 승인 API에 관리자 권한 검증 로직 추가 확인.

## 3. 🖼️ 바코드 보호 이미지 처리 (Payment + AI 연동)
**문제점:** 기능 명세서 상 "바코드 보호를 위한 이미지 슬라이싱/마스킹" 기능이 필요하나 현재 구현 없음.
**작업 내용:**
1.  **[AI] 마스킹 API 확인**: AI 서버에 이미지를 보내면 바코드 부분을 가려주는 API가 있는지 확인 (없으면 요청 또는 구현).
2.  **[Payment] 판매 등록 로직 수정**:
    *   사용자가 이미지 업로드 -> Payment 서버 -> AI 서버(마스킹 요청) -> 마스킹된 이미지 수신 -> S3 업로드.
    *   (원본은 구매자에게만 보여주고, 판매 목록에는 마스킹된 이미지 노출)

## 4. 💰 추가 기능 구현 (우선순위 순)
1.  **[Payment] AI 가격 추천 API**: `GET /sales/price-suggestion` 구현 (AI 서버 연동).
2.  **[Payment] 기프티콘 선물하기**: `POST /gifts/send` 구현.
3.  **[Payment] 포인트 출금 신청**: `POST /points/withdraw` 구현.

## 5. 📝 참고 사항
*   **Manage 서버 파일 경로**: `manage/src/main/java/com/cony/manage/...`
*   **Payment 서버 파일 경로**: `payment/src/main/java/com/cony/payment/...`
*   **기능 명세서**: `기능명세서.html` (루트 디렉토리)
