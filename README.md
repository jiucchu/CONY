# 🍿 CONY - 기프티콘 관리 서비스

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Python](https://img.shields.io/badge/Python-3.10.11-yellow)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen)
![React Native](https://img.shields.io/badge/React%20Native-0.83.1-61DAFB)

**기프티콘을 공유하고, 관리하고, 결제까지 한 번에!**

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [배포 가이드](#-배포-가이드)
- [팀 정보](#-팀-정보)

---

## 🎯 프로젝트 소개

**CONY**는 기프티콘을 효율적으로 관리하고 공유할 수 있는 모바일 서비스입니다.

- 📱 **모바일 앱** (React Native)으로 언제 어디서나 기프티콘 관리
- 🤖 **OCR**로 기프티콘 자동 인식 및 분류
- 💳 **카카오페이 연동**으로 간편한 포인트 충전/결제

> 💡 **Note**: 초기에는 웹 서비스(Next.js PWA)도 함께 개발하였으나, 모바일 앱에 집중하기 위해 웹 개발은 중단하고 앱 중심으로 전환하였습니다.

---

## ✨ 주요 기능

### 🎁 기프티콘 관리
- 기프티콘 등록 및 OCR 자동 인식
- 유효기간 알림 및 관리
- 바코드 스캔 및 생성

### 👥 기프티콘 공유
- 공유방(Room) 생성 및 관리
- 친구/그룹과 기프티콘 공유

### 💰 결제 및 충전
- 카카오페이 연동 포인트 충전
- 포인트로 기프티콘 거래

### 🔐 소셜 로그인
- Google OAuth 로그인
- Kakao OAuth 로그인

### 🔔 알림
- Firebase Cloud Messaging(FCM) 푸시 알림
- 유효기간 만료 알림
- 자동 판매 등록 알림

---

## 🛠 기술 스택

### Backend
| 기술 | 버전 | 설명 |
|:---:|:---:|:---|
| Java | 17 | 주 개발 언어 |
| Spring Boot | 3.5.9 | 백엔드 프레임워크 |
| MySQL | 8.0 | 관계형 데이터베이스 |
| Redis | - | 세션/캐시 저장소 |
| Python | 3.10.11 | AI 서비스 |

### Frontend (Mobile)
| 기술 | 버전 | 설명 |
|:---:|:---:|:---|
| React Native | 0.83.1 | 모바일 앱 |
| TypeScript | 5.x | 타입 안정성 |

### Infrastructure
| 기술 | 설명 |
|:---:|:---|
| Docker / Docker Compose | 컨테이너화 및 오케스트레이션 |
| Jenkins | CI/CD 파이프라인 |
| Nginx | 웹 서버 / 리버스 프록시 |
| AWS S3 | 이미지/파일 스토리지 |
| Prometheus + Grafana | 모니터링 |

---

## 📁 프로젝트 구조

```
S14P11C106/
├── 📱 CONY-APP/          # React Native 모바일 앱
│   ├── src/              # 소스 코드
│   ├── android/          # Android 네이티브 코드
│   └── ios/              # iOS 네이티브 코드
│
├── 🌐 CONY-WEB/          # (개발 중단) Next.js 웹 서비스 → 앱으로 전환
│
├── ⚙️ CONY-BE/           # Spring Boot 백엔드
│   ├── manage/           # 관리 서버 (인증, 기프티콘, 공유)
│   ├── payment/          # 결제 서버 (카카오페이, 포인트)
│   ├── ai/               # AI 서버 (OCR, 임베딩)
│   └── docker-compose.yml
│
├── 📊 monitoring/        # 모니터링 설정
│   ├── prometheus/       # Prometheus 설정
│   └── grafana/          # Grafana 대시보드
│
├── 📄 exec/              # 배포 문서
│   ├── 1.빌드_및_배포_가이드.md
│   ├── 2.외부_서비스_정보.md
│   ├── 3.DB_덤프_파일_최신본.sql
│   └── 4.시연_시나리오.md
│
└── Jenkinsfile           # CI/CD 파이프라인 정의
```

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** >= 20
- **Java** 17
- **Docker** & **Docker Compose**
- **Android Studio** (앱 개발 시)
- **Xcode** (iOS 개발 시)

### Backend 로컬 실행

```bash
# 1. 저장소 클론
git clone https://lab.ssafy.com/s14-webmobile1-sub1/S14P11C106.git
cd S14P11C106

# 2. 환경 변수 설정 (.env 파일 생성)
cd CONY-BE
# .env 파일에 필요한 환경 변수 설정 (exec/1.빌드_및_배포_가이드.md 참조)

# 3. Docker Compose로 서비스 실행
docker compose up -d --build
```

### Mobile App 로컬 실행

```bash
cd CONY-APP

# 의존성 설치
npm install

# Metro 서버 시작
npm start

# Android 앱 실행
npm run android

# iOS 앱 실행 (macOS만)
bundle install
bundle exec pod install
npm run ios
```

### ~~Web 로컬 실행~~ (개발 중단)

> ⚠️ **CONY-WEB**은 개발이 중단되었습니다. 모바일 앱(CONY-APP)을 이용해 주세요.

---

## 📦 배포 가이드

자세한 배포 방법은 **[exec/1.빌드_및_배포_가이드.md](./exec/1.빌드_및_배포_가이드.md)** 를 참조하세요.

### 서비스 포트 정보

| 서비스 | 외부 포트 | 내부 포트 |
|:---:|:---:|:---:|
| Payment | 8081 | 8080 |
| Manage | 8082 | 8080 |
| AI | 8000 | 8000 |

### CI/CD 파이프라인

Jenkins를 통해 자동 배포가 구성되어 있습니다:

1. **Checkout** - Git 소스 체크아웃
2. **Prepare Backend** - 환경 변수 및 Firebase Key 주입
3. **Deploy Services** - 변경된 서비스만 선택적 배포 (payment/manage/ai)
4. **Clean up** - 미사용 Docker 이미지 정리

---

## 📚 문서

| 문서 | 설명 |
|:---|:---|
| [빌드 및 배포 가이드](./exec/1.빌드_및_배포_가이드.md) | 환경 구성 및 배포 방법 |
| [외부 서비스 정보](./exec/2.외부_서비스_정보.md) | OAuth, 결제, 클라우드 서비스 정보 |
| [시연 시나리오](./exec/4.시연_시나리오.md) | 주요 기능 시연 흐름 |

---

## 👥 팀 정보

**SSAFY 14기 - C106팀**

| 이름 | 역할 | 담당 |
|:---:|:---:|:---|
| 박형주 | 팀장 | Backend, Infra |
| 박지유 | 팀원 | Frontend, PM |
| 홍여경 | 팀원 | Frontend, Backend |
| 정혜원 | 팀원 | Backend |
| 류병선 | 팀원 | Backend |
| 박설희 | 팀원 | AI |

---

<div align="center">

Made with ❤️ by Team C106

</div>
