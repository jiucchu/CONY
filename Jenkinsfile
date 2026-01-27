pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Env') {
            steps {
                script {
                    // 서버의 워크스페이스에 사용자가 직접 생성한 .env 파일이 있는지 확인
                    def exists = sh(script: "test -f .env", returnStatus: true) == 0
                    if (exists) {
                        echo "Found .env file managed by user."
                    } else {
                        echo "Warning: .env file not found in workspace."
                        // 필요하다면 여기서 error "..." 로 빌드를 중단시킬 수 있습니다.
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    // .env 파일이 있으면 docker-compose가 자동으로 읽어서 사용합니다.
                    sh 'docker-compose up --build -d'
                }
            }
        }
        
        stage('Clean up') {
             steps {
                script {
                    sh 'docker image prune -f'
                }
             }
        }
    }
}