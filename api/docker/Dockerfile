FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code and configuration files needed for build
COPY src ./src
COPY tsconfig.json ./

# Build optimized bundle with bundling (not compilation to executable)
# Using --target=bun for optimal performance with Bun runtime
# --packages=external keeps node_modules as external dependencies (not bundled)
RUN bun build src/server.ts --outdir dist --target bun --minify --sourcemap --packages=external

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy built bundle and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy configuration files needed at runtime
COPY tsconfig.json ./
COPY drizzle.config.ts ./

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the bundled application
CMD ["bun", "dist/server.js"]
