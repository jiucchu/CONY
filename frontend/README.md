# Frontend – webmobile1-skeleton

Kurento 기반 화상회의 서비스의 프런트엔드 스켈레톤 모듈입니다. Vue 3 + Element Plus UI를 사용하며, 학습 목적으로 제공됩니다.

## 1. Tech Stack

| 구분 | 기술 | 비고 |
| ---- | ---- | ---- |
| Framework | Vue 3, Vue Router, Vuex | Element Plus UI, Axios |
| Build Tool | Vue CLI Service 4.5, Webpack 4 | npm scripts |
| Language | JavaScript (ES2020), Sass | Stylus, Babel |
| Node.js | 16.20.2 LTS | npm |

## 2. Prerequisites

- **Node.js 16.20.x (LTS)** + npm
- **Backend API** (`https://localhost:8443`) 및 **Kurento 서버** (`localhost:8888`)가 실행 중이어야 주요 기능 정상 동작
- 환경별 API 엔드포인트는 `vue.config.js` 프록시 설정에서 수정 가능

## 3. Project Setup

### 1. 환경 변수 설정
```bash
cp env.example .env
```
- 기본값은 개발 모드(`NODE_ENV=development`)입니다. 필요 시 `.env` 파일에서 수정하세요.

### 2. 의존성 설치
```bash
npm install
```

## 4. Run & Build

### 개발 서버 (권장)
```bash
npm run serve
```
- 기본 포트: **8083** (`https://localhost:8083`)
- HTTPS 사용 (자체 서명 인증서)
- 백엔드 API(`https://localhost:8443`)로 자동 프록시 설정됨

### 배포 번들 생성
```bash
npm run build
```
- 빌드 결과물은 `vue.config.js`의 `outputDir` 설정에 따라 자동으로 `backend/src/main/resources/dist`에 생성됩니다.
- 백엔드 재실행 시 `https://localhost:8443`에서 정적 리소스로 서비스됩니다.

### Lint & Fix
```bash
npm run lint
```

## 5. 주요 경로
```
src/
├── App.vue               # 진입점
├── assets/               # 이미지, 폰트, 스타일 자원
├── common/               # 공통 설정/유틸/라이브러리
├── main.js               # 앱 초기화
└── views/                # 페이지 및 하위 컴포넌트
```

## 6. 백엔드와 연동

### 프록시 설정
- `vue.config.js`: `/api/v1`, `/webjars`, `/group-call`, `/upload` 요청을 `https://localhost:8443`으로 프록시
- 개발 서버(`npm run serve`) 실행 시 자동으로 백엔드 API로 요청 전달

### 인증 및 API 통신
- **JWT 저장 방식**: `src/common/lib/axios.js`에서 설정
- **Axios 인터셉터**: 요청/응답 처리

### 실시간 회의 기능
- 백엔드(`https://localhost:8443`) 및 Kurento Media Server(`localhost:8888`)가 실행 중이어야 정상 동작
- WebRTC WebSocket 연결은 백엔드를 통해 Kurento에 연결됩니다.

> **참고**: skeleton 프로젝트는 학습 목적으로 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다. 완성된 코드는 `webmobile1-complete` 프로젝트를 참고하세요.

## 7. 주요 포트 및 접속 정보

| 서비스 | 포트 | URL |
| ---- | ---- | ---- |
| 프론트엔드 개발 서버 | 8083 | `https://localhost:8083` (HTTPS) |
| 백엔드 API (HTTPS) | 8443 | `https://localhost:8443` |
| 백엔드 API (HTTP) | 8080 | `http://localhost:8080` |
| Swagger UI | 8443 | `https://localhost:8443/swagger-ui/index.html` |

## 8. Troubleshooting

- **프론트엔드 설치/빌드 실패**: `rm -rf node_modules package-lock.json && npm install`
- **포트 충돌**: 8083 포트 사용 여부 확인
- **백엔드 연결 실패**: 백엔드가 `https://localhost:8443`에서 실행 중인지 확인
- **프록시 오류**: `vue.config.js`의 프록시 설정 확인
