pipeline {
    agent any

    // 1. 공통 환경 변수 설정 (필요시 수정)
    environment {
        // 이미 생성해둔 도커 네트워크 이름
        DOCKER_NETWORK = 'cony-net' 
    }

    stages {
        // ===========================================================
        // 2. 프론트엔드 (FE) 배포 스테이지
        // 동작 조건: 브랜치 이름이 'FE' 이거나 'develop' 일 때 실행
        // ===========================================================
        stage('Frontend Build & Deploy') {
            when {
                anyOf {
                    branch 'FE'       // FE 브랜치
                    branch 'develop'  // develop 브랜치 (통합 배포용)
                    branch 'buildtest' // buildtest 브랜치 (테스트용)
                }
            }
            steps {
                dir('CONY-WEB') {  // FE 폴더로 이동
                    script {
                        echo "🚀 [Frontend] 배포를 시작합니다..."
                        
                        // 1. 기존 컨테이너 중지 및 삭제 (에러 무시)
                        sh 'docker stop cony-web || true'
                        sh 'docker rm cony-web || true'
                        
                        // 2. 도커 이미지 빌드 (캐시 활용)
                        sh 'docker build --no-cache -t cony-web .'
                        
                        // 3. 컨테이너 실행 (네트워크 연결 필수!)
                        // -d: 백그라운드, --network: 백엔드와 통신용
                        sh "docker run -d --name cony-web -p 3000:3000 --network ${DOCKER_NETWORK} cony-web"
                        
                        // 4. 불필요한 이미지 정리
                        sh 'docker image prune -f'
                    }
                }
            }
        }

        // ===========================================================
        // 3. 백엔드 (BE) 배포 스테이지
        // 동작 조건: 브랜치 이름이 'BE' 이거나 'develop' 일 때 실행
        // ===========================================================
        stage('Backend Build & Deploy') {
            when {
                anyOf {
                    branch 'BE'       // BE 브랜치
                    branch 'develop'  // develop 브랜치
                    branch 'buildtest' // buildtest 브랜치 (테스트용)
                }
            }
            steps {
                dir('CONY-BE') {  // BE 폴더로 이동
                    script {
                        echo "☕ [Backend] 배포를 시작합니다..."
                        
                        // ★ 중요: 젠킨스 Credential을 이용해 .env 파일 생성 ★
                        // (젠킨스 관리 -> Credentials에 'cony-db-secret' 등의 ID로 등록해두면 보안상 더 좋습니다)
                        // 지금은 수동으로 파일을 복사해주는 방식을 쓰시거나, 
                        // 아래처럼 직접 값을 써주셔도 됩니다. (보안상 추천하진 않지만 가장 쉬운 방법)
                        
                        sh '''
                            echo "MYSQL_URL=jdbc:mysql://cony-db:3306/cony?serverTimezone=Asia/Seoul" > .env
                            echo "MYSQL_USERNAME=root" >> .env
                            echo "MYSQL_PASSWORD=root" >> .env
                        '''
                        
                        // 1. 기존 컨테이너 내리기
                        try {
                            sh 'docker compose down'
                        } catch (Exception e) {
                            sh 'docker-compose down || true'
                        }

                        // 2. 다시 빌드하고 실행 (빌드와 실행을 분리!)
                        try {
                            // (1) 캐시 없이 강제 빌드 먼저 수행
                            sh 'docker compose build --no-cache'
                            // (2) 빌드된 이미지로 컨테이너 실행
                            sh 'docker compose up -d'
                        } catch (Exception e) {
                            // 혹시 구버전(docker-compose)일 경우를 대비한 백업
                            sh 'docker-compose build --no-cache'
                            sh 'docker-compose up -d'
                        }
                        
                        // 3. 불필요한 이미지 정리
                        sh 'docker image prune -f'
                    }
                }
            }
        }
    }
    
    // 빌드 후 처리
    post {
        always {
            // 작업 공간 청소 (디스크 용량 확보)
            cleanWs()
        }
    }
}