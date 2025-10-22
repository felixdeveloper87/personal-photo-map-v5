# Multi-stage Dockerfile for PhotoMap Frontend
# Supports both development and production builds

# Build arguments
ARG BUILD_ENV=production
ARG VITE_BACKEND_URL=http://localhost:8092

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# Production serve stage
FROM nginx:stable-alpine AS production
WORKDIR /app

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Use entrypoint script
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

# Final stage - choose based on BUILD_ENV
FROM ${BUILD_ENV} AS final
