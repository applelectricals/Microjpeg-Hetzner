FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies (image processing)
RUN apt-get update && apt-get install -y \
    imagemagick \
    libraw-bin \
    dcraw \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# THIS IS THE FIX: Use legacy-peer-deps for npm ci in production
# Vike's react-streaming wrongly requires React 19 — this ignores it safely
ENV NPM_CONFIG_PRODUCTION=false
RUN npm ci --legacy-peer-deps

# Copy all application code
COPY . .

# Build the application (Vike will prerender all pages here)
RUN npm run build

# Switch to production (dev deps removed)
ENV NODE_ENV=production
ENV PORT=10000

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run migrations then start
CMD sh -c "npm run db:push && npm start"