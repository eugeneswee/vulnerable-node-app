pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-16'
    }
    
    environment {
        DOCKER_IMAGE = 'vulnerable-node-app'
        SONAR_PROJECT_KEY = 'vulnerable-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '=== STAGE: Checkout ==='
                checkout scm
                sh 'ls -la'
                sh 'git branch -a'
                sh 'git log --oneline -n 3'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '=== STAGE: Install Dependencies ==='
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install'
                sh 'ls -la node_modules/ | head -10'
            }
        }
        
        stage('Code Quality Checks') {
            steps {
                echo '=== STAGE: Code Quality Checks ==='
                sh 'npm run lint || echo "No lint script configured"'
                sh 'find . -name "*.js" -not -path "./node_modules/*" | wc -l'
                echo 'JavaScript files ready for analysis'
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo '=== STAGE: Unit Tests ==='
                sh 'npm test'
                echo 'Tests completed (placeholder - no actual tests yet)'
            }
            post {
                always {
                    echo 'Test stage completed'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '=== STAGE: SAST - SonarQube Analysis ==='
                script {
                    def scannerHome = tool 'SonarScanner'
                    echo "Using SonarQube Scanner at: ${scannerHome}"
                    
                    withSonarQubeEnv('Local-SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=node_modules/**,coverage/**,*.log \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.projectVersion=${BUILD_NUMBER} \
                            -Dsonar.buildString=${BUILD_NUMBER} \
                            -Dsonar.qualitygate.wait=true \
                            -Dsonar.scm.disabled=true
                        """
                    }
                    
                    echo 'SonarQube analysis completed'
                    echo 'Results available at: http://localhost:9000/dashboard?id=' + SONAR_PROJECT_KEY
                }
            }
        }
        
        stage('Quality Gate Check') {
            steps {
                echo '=== STAGE: Quality Gate Check ==='
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        echo 'Waiting for SonarQube Quality Gate result...'
                        echo 'This may take a few minutes for the first analysis'
                        
                        def qg = waitForQualityGate()
                        
                        echo "Quality Gate Status: ${qg.status}"
                        
                        if (qg.status != 'OK') {
                            echo "❌ Quality Gate failed with status: ${qg.status}"
                            echo "Quality Gate conditions that failed:"
                            
                            // Handle different plugin versions - conditions property may not exist
                            try {
                                if (qg.conditions) {
                                    qg.conditions.each { condition ->
                                        echo "- ${condition.metricKey}: ${condition.actualValue} (threshold: ${condition.errorThreshold})"
                                    }
                                } else {
                                    echo "- Detailed condition information not available in this plugin version"
                                }
                            } catch (Exception e) {
                                echo "- Could not retrieve detailed condition information"
                                echo "- Plugin version may not support condition details"
                            }
                            
                            echo "🔍 Review quality issues at: http://localhost:9000/dashboard?id=${SONAR_PROJECT_KEY}"
                            error "Pipeline aborted due to quality gate failure: ${qg.status}"
                        } else {
                            echo "✅ Quality Gate passed successfully!"
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                expression { 
                    echo "Checking if should build Docker image..."
                    return currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            steps {
                echo '=== STAGE: Build Docker Image ==='
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    def image = docker.build("${DOCKER_IMAGE}:${BUILD_NUMBER}")
                    
                    echo "Tagging image as latest"
                    sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                    
                    echo "Docker images created:"
                    sh "docker images | grep ${DOCKER_IMAGE}"
                }
            }
        }
        
        stage('Security Scan Summary') {
            steps {
                echo '=== STAGE: Security Scan Summary ==='
                script {
                    echo "=== SECURITY ANALYSIS COMPLETE ==="
                    echo "Project: ${SONAR_PROJECT_KEY}"
                    echo "Build: ${BUILD_NUMBER}"
                    echo "SonarQube Dashboard: http://localhost:9000/dashboard?id=${SONAR_PROJECT_KEY}"
                    
                    if (currentBuild.result == null || currentBuild.result == 'SUCCESS') {
                        echo "Quality Gate: ✅ PASSED"
                    } else {
                        echo "Quality Gate: ❌ FAILED"
                    }
                    
                    // Archive scan results
                    archiveArtifacts artifacts: '.scannerwork/report-task.txt', allowEmptyArchive: true
                    
                    echo "Security scan artifacts archived successfully"
                }
            }
        }
    }
    
    post {
        always {
            echo '=== POST-BUILD: Cleanup ==='
            sh 'rm -rf node_modules/ || true'
            sh 'rm -rf .scannerwork/ || true'
        }
        success {
            echo '=== POST-BUILD: Success ==='
            echo "✅ Pipeline completed successfully!"
            echo "✅ Security analysis passed quality gate"
            echo "✅ Application ready for deployment"
            
            script {
                def sonarUrl = "http://localhost:9000/dashboard?id=${SONAR_PROJECT_KEY}"
                echo "📊 View detailed security report: ${sonarUrl}"
            }
        }
        failure {
            echo '=== POST-BUILD: Failure ==='
            echo "❌ Pipeline failed!"
            echo "❌ Most likely cause: Security vulnerabilities detected by SAST analysis"
            
            script {
                def sonarUrl = "http://localhost:9000/dashboard?id=${SONAR_PROJECT_KEY}"
                echo "🔍 Review security issues: ${sonarUrl}"
                echo "🚨 Expected failures for this vulnerable application:"
                echo "   - SQL Injection vulnerabilities"
                echo "   - Command Injection vulnerabilities"
                echo "   - Hardcoded credentials"
                echo "   - Cross-Site Scripting (XSS)"
                echo "   - Path traversal vulnerabilities"
            }
        }
        unstable {
            echo '=== POST-BUILD: Unstable ==='
            echo "⚠️ Pipeline completed with warnings"
            echo "⚠️ Some quality checks may have issues"
        }
    }
}
