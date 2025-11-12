# syntax=docker/dockerfile:1.4
# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application with cache mount for vite
RUN --mount=type=cache,target=/app/.svelte-kit \
    npm run build

# Remove dev dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm prune --production --prefer-offline

# Stage 2: Production
FROM node:20-alpine AS production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set environment to production
ENV NODE_ENV=production
ENV PORT=4321

# Expose port
EXPOSE 4321

# Health check using curl (more reliable than node for healthchecks)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4321 || exit 1

# Start the application
CMD ["node", "build/index.js"]
