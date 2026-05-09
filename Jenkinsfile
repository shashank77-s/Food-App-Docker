pipeline {

    agent any

    stages {

        stage('Build and Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up --build -d'
            }
        }

    }
}