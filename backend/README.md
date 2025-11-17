# 웹 기술 Backend (Skeleton)

웹 기술 프로젝트의 Backend 스켈레톤 코드입니다. 학습 목적으로 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다.

## 1. Tech Stack

| Project | Version | Description  |
| ------- |---------|--------------|
| Java    | 11      | Open JDK LTS (권장) |
| Gradle  | 6.9.4   | Build Tool   |
| MySQL   | 8.0.39  | Docker Compose로 자동 설치 가능 |
| Node.js | 16.20.2 | 프론트엔드 리소스 번들링용 |

## 2. Prerequisites

- **Java 11 JDK** (`JAVA_HOME` 설정 필수 - JDK 17 이상이면 Gradle 빌드 실패)
- **MySQL 8.0.39** (Docker Compose로 자동 설치 가능)
- **Node.js 16.20.x** (프론트 리소스 번들링용)
- **Docker 20.10+ / Docker Compose v2.x** (Kurento/coturn 컨테이너)

## 3. Database & Media Setup

### 1. 환경 변수 설정
```bash
cd backend
cp env.example .env
```
- 기본값은 로컬 테스트용(`TURN_PUBLIC_IP=127.0.0.1`)입니다. 외부 접속이 필요하면 `.env` 파일에서 수정하세요.

### 2. 인프라 컨테이너 기동
```bash
docker-compose up -d
docker-compose ps  # 컨테이너 상태 확인
```
- `ssafy_db`, `ssafy_turn`, `ssafy_kurento` 컨테이너가 **Up** 상태인지 확인합니다.
- MySQL 초기화 스크립트는 컨테이너 기동 시 자동 실행됩니다 (`./db/init.sql`).

### 3. TURN 서버 환경 변수 (`.env` 파일)
| 변수 | 설명 | 기본값 |
| ---- | ---- | ---- |
| `TURN_PUBLIC_IP` | coturn 서버의 공인 IP 주소 | `127.0.0.1` (로컬 테스트용) |
| `TURN_PORT` | STUN/TURN 포트 | `3478` |
| `TURN_USER` | TURN 인증 사용자명 | `myuser` |
| `TURN_PASSWORD` | TURN 인증 비밀번호 | `mypassword` |
| `TURN_REALM` | 인증 realm | `ssafy.com` |

> **참고**: `docker-compose.yml`의 `kurento` 서비스는 `coturn` 서비스를 참조하도록 설정되어 있습니다.

## 4. 개발 환경 구성

Windows 기준 개발 환경 구성 설명

1. OpenJDK 설치
   1. 11 LTS 설치 파일 다운로드 및 실행
      - https://adoptium.net/temurin/releases/?package=jdk&version=11
   2. 설치 후 명령 프롬프트(cmd) 확인
      ```
      > java -version
      ```
      출력 예)
      ```
      openjdk version "11.0.x" ...
      ```

2. 데이터베이스 구성 *(Docker Compose 사용 시 자동 설치)*
   - `docker-compose up -d` 실행 시 MySQL 8.0.39가 자동으로 설치됩니다.
   - 수동 설치가 필요한 경우:
     1. MySQL 다운로드 사이트에서 Community 설치 파일 다운로드 및 실행
        - https://dev.mysql.com/downloads/installer/
     2. MySQL Server, MySQL Shell을 포함하여 설치
     3. DB 및 계정 생성
        ```sql
        create database IF NOT EXISTS `ssafy_web_db` collate utf8mb4_general_ci;
        ```

3. IDE 설치
   1. JetBrains 공식 사이트에서 IntelliJ IDE Community Edition 설치 파일 다운로드 및 실행
      - https://www.jetbrains.com/ko-kr/idea/download/

4. 스켈레톤 다운로드 및 실행

   1. 프로젝트 다운로드
      ```
      git clone <repo URL>
      ```

   2. IntelliJ의 [File] - [Open]에서 backend 폴더 선택 후 [OK]
    
   3. `src/main/resources/application.properties` 수정
   
      ```
      spring.datasource.hikari.username=<사용자 계정>
      spring.datasource.hikari.password=<비밀번호>
      ```
      - Docker Compose 사용 시: `root / 1234`
      - 로컬 MySQL 사용 시: 직접 생성한 계정 정보 입력

   4. [Gradle Tasks] 탭의 [Run Gradle Tasks] 선택하여 실행

## 5. Build & Run

### 빌드 및 실행
```bash
./gradlew clean build
./gradlew bootRun --args='--spring.profiles.active=local'
```
- **기본 포트**: HTTP 8080 / **HTTPS 8443** (기본 접속 포트)
- **Swagger UI**: `https://localhost:8443/swagger-ui/index.html`
- **로컬 프로파일**: `--args='--spring.profiles.active=local'` 옵션 사용 시 `application-local.properties` 설정이 적용됩니다 (Docker Compose DB 연결, 로컬 Kurento 연결)
- **주의**: skeleton은 기본 설정만 제공되며, 일부 기능은 학습자가 직접 구현해야 합니다.

## 6. Directory Overview (`src`)

```
src/main
├── generated
├── java
│   └── com
│       └── ssafy
│           ├── GroupCallApplication.java
│           ├── api  /* REST API 요청관련 컨트롤러, 서비스, 요청/응답 모델 정의*/
│           │   ├── controller
│           │   │   ├── AuthController.java
│           │   │   └── UserController.java
│           │   ├── request
│           │   │   ├── UserLoginPostReq.java
│           │   │   └── UserRegisterPostReq.java
│           │   ├── response
│           │   │   ├── UserLoginPostRes.java
│           │   │   └── UserRes.java
│           │   └── service
│           │       ├── UserService.java
│           │       └── UserServiceImpl.java
│           ├── common /* 공용 유틸, 응답 모델, 인증, 예외처리 관련 정의*/
│           │   ├── auth
│           │   │   ├── JwtAuthenticationFilter.java
│           │   │   ├── SsafyUserDetailService.java
│           │   │   └── SsafyUserDetails.java
│           │   ├── exception
│           │   │   └── handler
│           │   │       └── NotFoundHandler.java
│           │   ├── model
│           │   │   └── response
│           │   │       └── BaseResponseBody.java
│           │   └── util
│           │       ├── JwtTokenUtil.java
│           │       └── ResponseBodyWriteUtil.java
│           ├── config /* WebMvc 및 JPA, Security, Swagger 등의 추가 플러그인 설정 정의*/
│           │   ├── JpaConfig.java
│           │   ├── SecurityConfig.java
│           │   ├── SwaggerConfig.java
│           │   └── WebMvcConfig.java
│           └── db /* 디비에 저장될 모델 정의 및 쿼리 구현 */
│               ├── entity
│               │   ├── BaseEntity.java
│               │   └── User.java
│               └── repository
│                   ├── UserRepository.java
│                   └── UserRepositorySupport.java
└── resources
    └── application.properties /* 웹 리소스(서버 host/port, 디비 host/port/계정/패스워드) 관련 설정 정의 */
```

## 7. Frontend 연동

프론트엔드는 별도 디렉터리(`../frontend/`)에서 관리됩니다.

- **개발 환경**: `frontend/`에서 `npm run serve`로 개발 서버 실행 (포트 8083, HTTPS)
  - 프론트엔드 개발 서버는 백엔드 `https://localhost:8443`로 자동 프록시됩니다.
- **프론트엔드 빌드**: `frontend/`에서 `npm run build` 실행 시 `vue.config.js`의 `outputDir` 설정에 따라 자동으로 `backend/src/main/resources/dist`에 결과물이 생성됩니다.

## 8. Troubleshooting

- **Gradle 빌드 오류**: `JAVA_HOME`이 JDK 11을 가리키는지 확인 (`java -version`)
- **DB 연결 실패**: 
  - `docker-compose ps`로 `ssafy_db` 컨테이너 상태 확인
  - `application.properties`의 DB 연결 정보 확인
  - MySQL 초기화 완료 여부: `docker logs ssafy_db`
- **Kurento 연결 문제**: 
  - `docker logs ssafy_kurento`로 컨테이너 상태 확인
  - `application.properties`의 `kms.url` 설정 확인
- **JWT 인증 실패**: `jwt.secret` 값이 일치하는지 확인
- **포트 충돌**: 8443, 8080, 32000, 8888 포트 사용 여부 확인
