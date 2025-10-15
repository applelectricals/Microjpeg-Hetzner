FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies (Ubuntu packages - same as Render)
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

# Install dependencies (including devDependencies for build)
ENV NPM_CONFIG_PRODUCTION=false
RUN npm ci

# Copy all application code
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production
ENV PORT=10000

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run DB migration and start app
CMD npm run db:push && npm start
