# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency files only
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ===================================
# Stage 2: Builder (Expo Web)
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy configuration files
COPY app.json ./
COPY tsconfig.json ./
COPY metro.config.js ./
COPY tailwind.config.js ./
COPY index.ts ./

# Copy source code
COPY App.tsx ./
COPY App-enhanced.tsx ./
COPY App-full.tsx ./
COPY AppContent.tsx ./
COPY global.css ./
COPY assets/ ./assets/
COPY src/ ./src/

# Build for web
RUN npx expo build:web

# ===================================
# Stage 3: Production (Nginx)
# ===================================
FROM nginx:alpine AS production

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/health || exit 1

CMD ["nginx", "-g", "daemon off;"]