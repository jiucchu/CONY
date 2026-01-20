pipeline {
    agent any

    environment {
        // Jenkins Credentials Binding Plugin을 사용하여 비밀 정보 주입
        // Jenkins 관리 -> Credentials에서 'cony-db-props'라는 ID로 Secret File 또는 Username/Password 등을 등록해야 함
        // 여기서는 예시로 환경 변수를 직접 매핑하거나 파일 생성 방식을 제안합니다.
        
        // 예시: Jenkins Credentials에 등록된 Username/Password 사용 시
        // DB_CREDS = credentials('cony-db-creds-id') 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Env') {
            steps {
                script {
                    // Jenkins Credentials를 사용하여 .env 파일 생성
                    // 실제 운영 시에는 withCredentials 블록을 사용하는 것이 좋습니다.
                    // 예:
                    // withCredentials([usernamePassword(credentialsId: 'db-creds', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASS')]) {
                    //     sh "echo DB_URL=jdbc:mysql://cony-mysql:3306/cony?serverTimezone=Asia/Seoul > .env"
                    //     sh "echo DB_USERNAME=\$DB_USER >> .env"
                    //     sh "echo DB_PASSWORD=\$DB_PASS >> .env"
                    // }
                    
                    // 로컬 테스트용 단순 echo (실제 Jenkins 설정에 맞춰 수정 필요)
                    echo "Checking for .env file or creating one from credentials..."
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    // .env 파일이 존재해야 docker-compose가 변수를 로드합니다.
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