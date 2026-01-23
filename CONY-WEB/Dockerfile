# 1. Node 이미지 사용
FROM node:20-alpine

# 2. 작업 폴더 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사
COPY . .

# 5. Next.js 빌드
RUN npm run build

# 6. 실행 포트 설정 (Next.js 기본 포트)
EXPOSE 3000

# 7. 실행 명령어
CMD ["npm", "start"]