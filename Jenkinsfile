pipeline {
    agent any
    tools {
        jdk 'jdk-17'
        nodejs 'node-18'
    }
    
    environment {
        DOCKER_REGISTRY = 'emnasahnoun'
        COMPOSE_PROJECT_NAME = 'systeodigital'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/EmnaSahnoun/ArchiManage_app.git', branch: 'main'
                sh 'docker-compose down || true'
            }
        }
        
        stage('Build and Package') {
            parallel {
                // Services Java
                stage('Build Eureka') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/EurekaCompain') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Gateway') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/Gateway/Gatway') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                stage('Build Company Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/ProjetCompain') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                stage('Build Project Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/ProjectService') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Activity Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/Activity-Service') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Document Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/DocumentService') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Notification Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/NotificationService') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Commercial Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Back/MicroserviceEureka/CommercialService') {
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                // Service Node.js
                stage('Build Email Service') {
                    steps {
                        dir('Back/MicroserviceEureka/emailService') {
                            sh 'npm install'                            
                        }
                    }
                }
                
                // Frontend Angular
                stage('Build Angular Frontend') {
                    steps {
                        dir('Front/WebFront') {
                             sh 'npm config set legacy-peer-deps true'
                             sh 'npm install'
                             sh 'npm run build -- --configuration=production'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                // Images Java
                stage('Build Eureka Image') {
                    steps {
                        dir('Back/MicroserviceEureka/EurekaCompain') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/eureka-server ."
                        }
                    }
                }
                
                stage('Build Gateway Image') {
                    steps {
                        dir('Back/Gateway/Gatway') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/gateway-service ."
                        }
                    }
                }
                stage('Build CompanyService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/ProjetCompain') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/company-service ."
                        }
                    }
                }
                stage('Build ProjectService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/ProjectService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/project-service ."
                        }
                    }
                }
                
                stage('Build ActivityService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/Activity-Service') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/activity-service ."
                        }
                    }
                }
                
                stage('Build DocumentService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/DocumentService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/document-service ."
                        }
                    }
                }
                
                stage('Build NotificationService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/NotificationService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/notification-service ."
                        }
                    }
                }
                
                stage('Build CommercialService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/CommercialService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/commercial-service ."
                        }
                    }
                }
                
                // Image Node.js
                stage('Build EmailService Image') {
                    steps {
                        dir('Back/MicroserviceEureka/emailService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/email-service ."
                        }
                    }
                }
                
                // Image Angular
                stage('Build Frontend Image') {
                    steps {
                        dir('Front/WebFront') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/angular-frontend ."
                        }
                    }
                }
            }
        }
        stage('Verify Builds') {
    steps {
        script {
            def images = [
                "${env.DOCKER_REGISTRY}/email-service",
                "${env.DOCKER_REGISTRY}/angular-frontend"
            ]
            
            images.each { image ->
                try {
                    sh "docker inspect ${image}"
                } catch (Exception e) {
                    error("Image ${image} n'a pas été construite correctement")
                }
            }
        }
    }
}
        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Docker_Hub',
                    passwordVariable: 'DockerHubPassword',
                    usernameVariable: 'DockerHubUsername'
                )]) {
                    sh "docker login -u ${env.DockerHubUsername} -p ${env.DockerHubPassword}"
                    
                    sh "docker push ${env.DOCKER_REGISTRY}/eureka-server"
                    sh "docker push ${env.DOCKER_REGISTRY}/gateway-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/project-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/company-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/activity-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/document-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/notification-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/commercial-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/email-service"
                    sh "docker push ${env.DOCKER_REGISTRY}/angular-frontend"
                }
            }
        }
         stage('Nettoyage Pré-déploiement') {
    steps {
        sh '''
        # Arrêter et supprimer tous les conteneurs
        docker-compose -p ${COMPOSE_PROJECT_NAME} down || true
        
        # Vérifier et tuer les processus utilisant les ports critiques
        sudo lsof -i :5672 | grep LISTEN | awk '{print $2}' | xargs -r sudo kill -9
        sudo lsof -i :27017 | grep LISTEN | awk '{print $2}' | xargs -r sudo kill -9
        '''
    }
}
         stage('Démarrage Infrastructure') {
    steps {
        sh '''
        # Démarrer MongoDB et RabbitMQ avec vérification
        docker-compose -p ${COMPOSE_PROJECT_NAME} up -d mongodb rabbitmq
        
        # Attendre que MongoDB soit prêt
        timeout 180 bash -c 'until docker exec mongodb mongosh --eval "db.runCommand({ping:1})" -u emna -p emna --authenticationDatabase admin; do sleep 5; echo "En attente de MongoDB..."; done'
        
        # Attendre que RabbitMQ soit prêt
        timeout 180 bash -c 'until docker exec rabbitmq rabbitmqctl await_startup; do sleep 5; echo "En attente de RabbitMQ..."; done'
        '''
    }
}
        
        stage('Déploiement') {
            steps {
                sh '''
                # Démarrer Eureka en premier
                docker-compose -p ${COMPOSE_PROJECT_NAME} up -d eureka-server
                
                # Attendre qu'Eureka soit prêt
                timeout 60 bash -c 'until curl -f http://localhost:8761/actuator/health; do sleep 5; echo "En attente d\'Eureka..."; done'
                
                # Démarrer les autres services
                docker-compose -p ${COMPOSE_PROJECT_NAME} up -d --build --force-recreate
                '''
            }
        }
        
        stage('Vérification') {
            steps {
                sh '''
                # Vérifier que tous les services sont enregistrés dans Eureka
                curl -f http://localhost:8761/eureka/apps
                
                # Vérifier la santé des services principaux
                curl -f http://localhost:9091/actuator/health
                '''
            }
        }
    }
    
    post {
        failure {
            // En cas d'échec, faire un rollback
            sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} down'
            // Notification d'échec
        }
        always {
            // Nettoyage
            sh 'docker system prune -f'
        }
    }
}    

