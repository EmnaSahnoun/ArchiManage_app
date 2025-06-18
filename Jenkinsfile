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
        // Nouveau stage ajouté ici
    stage('Vérification Fichiers') {
        steps {
            sh '''
            # Vérifier que docker-compose.yaml existe
            if [ ! -f docker-compose.yaml ]; then
                echo "ERREUR: docker-compose.yaml manquant!"
                exit 1
            fi
            
            # Vérifier la syntaxe YAML
            if ! python3 -c 'import yaml; yaml.safe_load(open("docker-compose.yaml"))'; then
                echo "ERREUR: Syntaxe YAML invalide dans docker-compose.yaml"
                exit 1
            fi
            
            # Vérifier aussi avec docker-compose
            docker-compose config
            '''
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
        # Arrêter et supprimer tous les containers et réseaux
        docker-compose -p ${COMPOSE_PROJECT_NAME} down || true
        
        # Tuer les processus utilisant les ports critiques
        sudo lsof -ti :27017 | xargs -r sudo kill -9 || true
        sudo lsof -ti :5672 | xargs -r sudo kill -9 || true
        
        # Supprimer les containers zombies
        docker rm -f $(docker ps -aq) || true
        docker network prune -f
        '''
    }
}
         stage('Démarrage Infrastructure') {
    steps {
        script {
            try {
                // D'abord MongoDB seul
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} up -d mongodb'
                
                // Attendre que MongoDB soit prêt
                sh '''
                timeout 180 bash -c 'until docker exec mongodb mongosh --eval "db.runCommand({ping:1})" -u emna -p emna --authenticationDatabase admin; do 
                    sleep 5; 
                    echo "En attente de MongoDB..."; 
                done'
                '''
                
                // Puis RabbitMQ
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} up -d rabbitmq'
                
                // Attendre RabbitMQ
                sh '''
                timeout 180 bash -c 'until curl -f http://localhost:15672; do 
                    sleep 5; 
                    echo "En attente de RabbitMQ..."; 
                done'
                '''
            } catch (Exception e) {
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} logs'
                error("Échec du démarrage de l'infrastructure")
            }
        }
    }
}
        
        stage('Deploy') {
            steps {
                sh 'docker-compose down && docker-compose up -d'
            }
        }
    }
}
