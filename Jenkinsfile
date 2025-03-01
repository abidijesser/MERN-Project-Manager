pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    sh 'npm run build-dev'
                }
            }
        }
    }
}
