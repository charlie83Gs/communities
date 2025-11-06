# Multi-stage build for communities-api
FROM oven/bun:1 AS base

WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lockb* ./

# Install dependencies (production only)
RUN bun install --frozen-lockfile --production

# Builder stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun build src/server.ts --outdir dist --target node

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy production dependencies from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy necessary runtime files
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db/migrations ./src/db/migrations

# Create necessary directories
RUN mkdir -p logs uploads/images

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application
CMD ["bun", "dist/server.js"]
