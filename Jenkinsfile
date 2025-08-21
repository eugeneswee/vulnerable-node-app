pipeline {
    agent {
        docker {
            image 'docker:24-cli'   // ephemeral Docker container
            args '-v /var/run/docker.sock:/var/run/docker.sock' // optional if you want host access
        }
    }
    
    tools {
        nodejs 'NodeJS-16'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '=== STAGE: Checkout ==='
                echo 'Code checked out from SCM'
                sh 'ls -la'
                sh 'git branch -a'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '=== STAGE: Install Dependencies ==='
                echo 'Installing Node.js dependencies...'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install'
                sh 'ls -la node_modules/ | head -5'
            }
        }
        
        stage('Build Application') {
            steps {
                echo '=== STAGE: Build Application ==='
                echo 'Building application...'
                sh 'npm run build || echo "No build script defined, skipping"'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '=== STAGE: Run Tests ==='
                echo 'Running tests...'
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '=== STAGE: Build Docker Image ==='
                script {
                    echo 'Building Docker image...'
                    def image = docker.build("vulnerable-node-app:${env.BUILD_NUMBER}")
                    echo 'Tagging as latest...'
                    sh "docker tag vulnerable-node-app:${env.BUILD_NUMBER} vulnerable-node-app:latest"
                    echo 'Docker images created:'
                    sh 'docker images | grep vulnerable-node-app'
                }
            }
        }
    }
    
    post {
        always {
            echo '=== POST-BUILD: Always ==='
            echo 'Pipeline completed'
        }
        success {
            echo '=== POST-BUILD: Success ==='
            echo '✅ Pipeline succeeded!'
            echo 'Application built and containerized successfully'
        }
        failure {
            echo '=== POST-BUILD: Failure ==='
            echo '❌ Pipeline failed!'
            echo 'Check the logs above for error details'
        }
    }
}
