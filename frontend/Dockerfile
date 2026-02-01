# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy serve config to dist
COPY public/serve.json dist/serve.json

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the built app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 5180

# Start server with SPA routing and dynamic PORT
CMD ["sh", "-c", "serve -c serve.json -s dist -l ${PORT:-5180}"]
