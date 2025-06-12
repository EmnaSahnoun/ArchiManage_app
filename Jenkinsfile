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
        stage('Start MongoDB') {
    steps {
        sh '''
        # Démarrer MongoDB si ce n'est pas déjà fait
        docker start mongodb || docker-compose -f docker-compose.yml -p ${COMPOSE_PROJECT_NAME} up -d mongodb
        
        # Attendre que MongoDB soit prêt
        timeout 60 bash -c 'until docker exec mongodb mongosh --eval "db.runCommand({ping: 1})" -u emna -p emna --authenticationDatabase admin; do sleep 2; echo "En attente de MongoDB..."; done'
        '''
    }
}

stage('Verify MongoDB') {
    steps {
        script {
            try {
                timeout(time: 5, unit: 'MINUTES') {
                    waitUntil {
                        def status = sh(
                            script: 'docker exec mongodb mongosh --eval "db.runCommand({ping: 1})" -u emna -p emna --authenticationDatabase admin',
                            returnStatus: true
                        )
                        return status == 0
                    }
                }
            } catch (err) {
                error "MongoDB n'est pas accessible après 5 minutes d'attente"
                sh 'docker logs mongodb'
                currentBuild.result = 'FAILURE'
            }
        }
    }
}

stage('Deploy MongoDB First') {
    steps {
        sh '''
        # Nettoyage
        docker-compose -f docker-compose.yml -p ${COMPOSE_PROJECT_NAME} down --remove-orphans --volumes || true
        
        # Démarrer MongoDB
        docker-compose -f docker-compose.yml -p ${COMPOSE_PROJECT_NAME} up -d --build mongodb
        
        # Attendre que MongoDB soit prêt
        for i in {1..30}; do
          if docker exec mongodb mongosh --eval "db.runCommand({ping: 1})" -u emna -p emna --authenticationDatabase admin; then
            echo "MongoDB est prêt"
            break
          fi
          sleep 5
          echo "Attente de MongoDB (tentative $i/30)..."
        done
        '''
    }
}
stage('Check Running Containers') {
    steps {
        sh 'docker ps -a'
    }
}        
stage('Deploy All Services') {
    steps {
        
            sh '''
            # Démarrer les autres services
            docker-compose -f docker-compose.yml -p ${COMPOSE_PROJECT_NAME} up -d --build --force-recreate
            
            # Vérification
            sleep 10
            docker-compose -f docker-compose.yml -p ${COMPOSE_PROJECT_NAME} ps
            '''
       
    }
}
        
        stage('Cleanup') {
            steps {
                sh 'docker system prune -f'
            }
        }
    }
    
    
}
