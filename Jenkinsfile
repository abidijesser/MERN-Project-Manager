pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                script {
                    dir('Server') { // Met un 'S' majuscule si le dossier est nommé 'Server'
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    dir('Server') { // Exécute npm run build-dev dans Server/
                        sh 'npm run build-dev'
                    }
                }
            }
        }
    }
}
