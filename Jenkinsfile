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

        steps{ 
            script { 
                def scannerHome = tool 'scanner' withSonarQubeEnv 
                { sh "${scannerHome}/bin/sonar-scanner" } } } }
    }
}
