FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies including Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    imagemagick \
    libraw-bin \
    dcraw \
    python3 \
    make \
    g++ \
    chromium \
    chromium-sandbox \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Configure Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for db:push and Puppeteer)
ENV NPM_CONFIG_PRODUCTION=false
RUN npm ci

# Copy all application code
COPY . .

# Build the application (includes SEO generation with Puppeteer)
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=10000

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations then start (use shell form, not exec form)
CMD sh -c "npm run db:push && npm start"
