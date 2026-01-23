pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    // 1. 기존 컨테이너가 돌고 있으면 강제로 멈추고 삭제 (에러 무시 || true)
                    sh 'docker stop cony-web || true'
                    sh 'docker rm cony-web || true'
                    
                    // 2. 도커 이미지 빌드 (이름: cony-web)
                    sh 'docker build -t cony-web .'
                    
                    // 3. 도커 컨테이너 실행 (3000번 포트)
                    sh 'docker run -d --name cony-web -p 3000:3000 cony-web'
                    
                    // 4. 불필요한 이미지 정리
                    sh 'docker image prune -f'
                }
            }
        }
    }
}