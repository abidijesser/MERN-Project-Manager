# Base image for Node.js (use a more recent version)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./Client/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY ./Client ./

# Ensure crypto polyfill is available
RUN npm install crypto-browserify --save --legacy-peer-deps

# Build the Vite app
RUN npm run build

# Production image
FROM nginx:stable-alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom Nginx config for SPA (Single Page Application)
COPY ./Client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Ngi
