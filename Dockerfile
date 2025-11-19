# ---------- Stage 1: build ----------
FROM node:18-alpine AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

# Install dependencies for the client app (assumes app is in /client)
# If your app is at project root (no client/), change COPY paths accordingly.
COPY ./client/package.json ./client/package-lock.json* ./client/yarn.lock* ./

# If you use npm
RUN if [ -f package-lock.json ]; then npm ci --silent; elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install --silent; fi

# Copy full client sources
COPY ./client ./

# Copy the sitemap generator script (assumes scripts/generate-sitemap.js at repo root)
# If your script is in the project root relative to Docker build context, copy it in.
COPY ./scripts ./scripts

# Generate sitemap at build-time (writes to public/sitemap.xml)
# Make sure scripts/generate-sitemap.js writes to ./public/sitemap.xml
RUN node ./scripts/generate-sitemap.js

# Build the production static bundle
# Works for CRA, Vite, or most React apps that expose "build" script in package.json
RUN npm run build

# ---------- Stage 2: production image (nginx) ----------
FROM nginx:stable-alpine AS production

# Copy nginx config (optional) - you can add a custom nginx.conf if needed
# COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the generated sitemap and robots.txt if present (already in build or public)
# If generate-sitemap placed sitemap in public/ then it is already included in /app/build
# but we copy public just in case:
COPY --from=builder /app/public/sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY --from=builder /app/public/robots.txt /usr/share/nginx/html/robots.txt

# Expose port and run nginx
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
