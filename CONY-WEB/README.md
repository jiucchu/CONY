# CONY-WEB

CONY 웹 애플리케이션 프로젝트

## 프로젝트 구조

```
CONY-WEB/
├── src/                    # 소스 코드 디렉토리
│   ├── app/                # Next.js App Router 페이지
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/         # 컴포넌트
│   │   └── common/         # 공통 컴포넌트 (Atomic Design)
│   │       ├── atoms/     # 가장 작은 단위 컴포넌트
│   │       ├── molecules/ # atoms 조합
│   │       ├── organisms/ # molecules 조합
│   │       └── templates/ # 페이지 레이아웃
│   ├── types/             # TypeScript 타입 정의
│   │   ├── common.d.ts
│   │   └── styled.d.ts
│   ├── constants/         # 상수 정의
│   │   └── colors.ts
│   └── lib/               # 라이브러리 설정
│       └── theme.ts
├── public/                # 정적 파일
└── package.json
```

## Atomic Design 구조

### Atoms (원자)
- 가장 작은 단위의 컴포넌트
- 재사용 가능한 기본 UI 요소
- 예: Button, Text, Input, Icon, Card

### Molecules (분자)
- Atoms를 조합한 컴포넌트
- 간단한 기능을 가진 UI 블록
- 예: FormField (Input + Label), SearchBar

### Organisms (유기체)
- Molecules와 Atoms를 조합한 컴포넌트
- 복잡한 기능을 가진 UI 섹션
- 예: Header, Navigation, ProductList

### Templates (템플릿)
- 페이지 레이아웃 구조
- Organisms를 배치한 레이아웃

## 스타일링

- **styled-components** 사용
- 테마는 `src/lib/theme.ts`에서 관리
- 색상은 `src/constants/colors.ts`에서 관리

## 개발 가이드

1. **컴포넌트 생성 시**
   - Atomic Design 원칙에 따라 적절한 레벨에 배치
   - 각 컴포넌트는 `index.ts`로 export
   - TypeScript 타입 정의 필수

2. **타입 정의**
   - `src/types/` 폴더에 도메인별로 분리
   - 공통 타입은 `src/types/common.d.ts`

3. **경로 별칭**
   - `@/` 별칭으로 `src/` 경로 접근
   - 예: `@/components`, `@/constants`, `@/types`
