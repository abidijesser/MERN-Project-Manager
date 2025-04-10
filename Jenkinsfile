pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                script {
                    dir('Server') { // Assure-toi que le dossier est bien "Server"
                        sh 'npm install' // Installe les dépendances
                        sh 'npm test' // Exécute les tests
                    }
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    dir('Server') {
                        sh 'npm run build-dev' // Compile l'application
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'scanner' // Assure-toi que l'outil SonarQube est bien configuré
                    withSonarQubeEnv('SonarQube') { 
                        sh "${scannerHome}/bin/sonar-scanner" // Exécute l'analyse SonarQube
                    }
                }
            }
        }
    }
}
