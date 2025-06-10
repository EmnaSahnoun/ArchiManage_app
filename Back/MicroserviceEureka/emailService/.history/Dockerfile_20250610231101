# Utiliser une image Node.js légère
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation des dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm install --production

# Copier le reste des fichiers du projet
COPY . .

# Copier éventuellement le fichier .env (s'il est nécessaire dans l'image)
# ATTENTION : Évitez de copier .env si vous utilisez des secrets/CI/CD
# COPY .env .env

# Définir les variables d'environnement dans le conteneur
ENV NODE_ENV=production

# Exposer le port sur lequel l'application écoute (correspond à votre .env : PORT=8079)
EXPOSE 8069

# Start the application
CMD ["npm", "start"]