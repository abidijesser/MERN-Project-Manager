pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                script {
                    dir('Server') { // Assure-toi que le dossier est bien "Server"
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    dir('Server') {
                        sh 'npm run build-dev'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'scanner'
                    withSonarQubeEnv('SonarQube') { 
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
    }
}
