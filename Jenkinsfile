pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // =========================================================
        // 1. Backend 배포 (CONY-BE 폴더가 변경되었을 때만 실행)
        // =========================================================
        stage('Deploy Backend') {
            when {
                changeset "CONY-BE/**"
            }
            steps {
                dir('CONY-BE') { 
                    script {
                        echo "🚀 Backend 변경 감지! 배포 시작..."

                        // 1. Jenkins Credential에서 값 가져오기
                        withCredentials([
                            string(credentialsId: 'SPRING_DATASOURCE_URL', variable: 'SPRING_DATASOURCE_URL'),
                            string(credentialsId: 'SPRING_DATASOURCE_USERNAME', variable: 'SPRING_DATASOURCE_USERNAME'),
                            string(credentialsId: 'SPRING_DATASOURCE_PASSWORD', variable: 'SPRING_DATASOURCE_PASSWORD'),
                            string(credentialsId: 'REDIS_HOST', variable: 'REDIS_HOST'),
                            string(credentialsId: 'REDIS_PORT', variable: 'REDIS_PORT'),
                            string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                            string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY')
                        ]) {
                            // 2. .env 파일 생성
                            sh """
                                echo "SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL}" > .env
                                echo "SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}" >> .env
                                echo "SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD}" >> .env
                                echo "REDIS_HOST=${REDIS_HOST}" >> .env
                                echo "REDIS_PORT=${REDIS_PORT}" >> .env
                                echo "AWS_ACCESS_KEY=${AWS_ACCESS_KEY}" >> .env
                                echo "AWS_SECRET_KEY=${AWS_SECRET_KEY}" >> .env
                            """
                        }

                        // 3. Docker Compose 실행
                        sh 'docker compose up -d --build'
                    }
                }
            }
        }

        // =========================================================
        // 2. Frontend 배포 (CONY-WEB 폴더가 변경되었을 때만 실행)
        // =========================================================
        stage('Deploy Frontend') {
            when {
                changeset "CONY-WEB/**"
            }
            steps {
                dir('CONY-WEB') {
                    script {
                        echo "🎨 Frontend 변경 감지! 배포 시작..."

                        // 1. 기존 컨테이너 중지 및 삭제 (에러 무시: || true)
                        // 처음 배포할 땐 컨테이너가 없어서 에러 날 수 있으므로 || true를 붙임
                        sh 'docker stop cony-web || true'
                        sh 'docker rm cony-web || true'

                        // 2. Docker 이미지 빌드
                        sh 'docker build -t cony-web .'

                        // 3. Docker 컨테이너 실행 (3000번 포트)
                        sh 'docker run -d --name cony-web -p 3000:3000 cony-web'
                    }
                }
            }
        }
        
        // =========================================================
        // 3. 공통 작업 (이미지 정리)
        // =========================================================
        stage('Clean up Image') {
             steps {
                script {
                    // 사용하지 않는 댕글링 이미지(Dangling images) 삭제
                    sh 'docker image prune -f'
                }
             }
        }
    }

    post {
        always {
            // BE 폴더에 들어가서 .env 삭제
            dir('CONY-BE') { 
                script {
                    sh "rm -f .env"
                    echo "🧹 Backend .env file deleted."
                }
            }
        }
        success {
            echo "🎉 모든 배포가 성공적으로 완료되었습니다!"
        }
        failure {
            echo "💥 배포 중 오류가 발생했습니다."
        }
    }
}