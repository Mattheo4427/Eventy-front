# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances de production
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ===================================
# Stage 2: Development (Expo Go)
# ===================================
FROM node:20-alpine AS development

# Installer les outils nécessaires pour Expo
RUN apk add --no-cache git

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer toutes les dépendances
RUN npm ci --ignore-scripts

# Copier les fichiers de configuration
COPY app.json ./
COPY tsconfig.json ./
COPY metro.config.js ./
COPY tailwind.config.js ./
COPY index.ts ./

# Copier le code source
COPY App.tsx ./
COPY App-enhanced.tsx ./
COPY App-full.tsx ./
COPY AppContent.tsx ./
COPY global.css ./
COPY assets/ ./assets/
COPY src/ ./src/

# Exposer les ports Expo
# 8081: Metro bundler
# 19000: Expo dev server
# 19001: Expo dev tools
EXPOSE 8081 19000 19001

# Variables d'environnement pour Expo
# Permet d'accéder à Expo depuis l'extérieur du container
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Commande par défaut
CMD ["npm", "start", "--", "--host", "0.0.0.0"]