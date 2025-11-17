# webmobile1-skeleton

실시간 그룹 화상 회의 서비스를 위한 **스켈레톤 프로젝트**입니다. 학습 목적으로 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다.

## 1. Tech Stack

| 구분 | 기술 | 버전 및 비고 |
| ---- | ---- | ---- |
| Frontend | Vue 3, Element Plus, Vue Router, Vuex | Node.js 16.20.2 LTS, npm |
| Backend | Spring Boot 2.4.5, Spring Security, QueryDSL | Java 11 권장, Gradle 6.9.4 |
| Realtime | Kurento Media Server 6.18.0, coturn 4.5.2 | Docker Compose를 통해 배포 |
| Database | MySQL 8.0.39 | `ssafy_web_db` |
| Auth & API | JWT, REST, Swagger | `https://localhost:8443/swagger-ui/index.html` |

## 2. Prerequisites

- **Docker Desktop, Docker Compose v2.x**
- **Java 11 JDK** (`JAVA_HOME` 설정 필수 - JDK 17 이상이면 Gradle 빌드 실패)
- **Node.js 16.20.x (LTS)** + npm
- **Windows/macOS/Linux** 모두 지원

## 3. 빠른 실행 흐름

### 권장 실행 순서 (로컬 개발 환경)

1. **인프라 컨테이너 기동**
   ```bash
   cd backend
   cp env.example .env  # 필요 시 TURN_PUBLIC_IP 수정
   docker-compose up -d
   ```

2. **백엔드 빌드 & 로컬 실행**
   ```bash
   cd backend
   ./gradlew clean build
   ./gradlew bootRun --args='--spring.profiles.active=local'
   ```
   - 기본 포트: **HTTPS 8443** (Swagger: `https://localhost:8443/swagger-ui/index.html`)
   - HTTP 8080도 사용 가능
   - **로컬 프로파일**: `--args='--spring.profiles.active=local'` 옵션 사용 시 Docker Compose DB 및 로컬 Kurento 연결 설정이 적용됩니다
   - **주의**: skeleton은 기본 설정만 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다.

3. **프론트엔드 개발 서버 실행**
   ```bash
   cd frontend
   npm install      # 최초 한 번만 실행 (의존성 설치)
   npm run serve    # https://localhost:8083
   ```

4. **접속 및 검증**
   - 프론트엔드: `https://localhost:8083` (개발 서버, HTTPS)
   - 백엔드 API: `https://localhost:8443`
   - Swagger UI: `https://localhost:8443/swagger-ui/index.html`

> **참고**: skeleton 프로젝트는 학습 목적으로 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다. 완성된 코드는 `webmobile1-complete` 프로젝트를 참고하세요.

## 4. 디렉터리 구조

```
webmobile1-skeleton/
├── README.md                          # 전체 개요 및 실행 요약 (현재 문서)
├── backend/                           # Spring Boot 프로젝트
│   ├── README.md                      # 백엔드 세부 실행 안내
│   ├── docker-compose.yml             # MySQL/Kurento/coturn 컨테이너 정의
│   ├── env.example                    # TURN 서버 환경 변수 템플릿
│   └── src/main/...                   # API, 도메인, 정적 리소스 포함
└── frontend/                          # Vue 3 프론트엔드
    ├── README.md                      # 프론트엔드 세부 실행 안내
    └── src/...                        # Vue 컴포넌트, 스토어, 라우터 등
```

## 5. 주요 포트 및 서비스

| 서비스 | 포트 | 설명 |
| ---- | ---- | ---- |
| Spring Boot (HTTPS) | 8443 | 백엔드 API 및 정적 리소스 (기본 접속 포트) |
| Spring Boot (HTTP) | 8080 | HTTP 접속 (선택) |
| Vue 개발 서버 | 8083 | 프론트엔드 개발 서버 (`npm run serve`, HTTPS) |
| MySQL | 32000 | Docker 호스트 포트 (컨테이너 내부: 3306) |
| Kurento Media Server | 8888 | WebRTC 미디어 서버 |
| coturn (STUN/TURN) | 3478 | NAT 트래버설 서버 |

## 6. Troubleshooting

- **Gradle 빌드 오류**: `JAVA_HOME`이 JDK 11을 가리키는지 확인 (`java -version`)
- **포트 충돌**: 8443, 8080, 8083, 32000, 8888, 3478 포트 사용 여부 확인
- **컨테이너 상태**: `docker-compose ps`로 `ssafy_db`, `ssafy_turn`, `ssafy_kurento` 실행 여부 확인
- **DB 연결 실패**: `docker logs ssafy_db`로 MySQL 초기화 완료 여부 확인
