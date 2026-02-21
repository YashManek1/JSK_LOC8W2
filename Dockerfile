# ----- Stage 1: Build Backend -----
FROM node:22-bullseye-slim AS backend-builder
WORKDIR /app/backend

# Copy package files and install ALL dependencies (including dev for NestJS CLI)
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Copy full backend source
COPY backend ./

# Generate Prisma and build NextJS/NestJS
RUN npx prisma generate
RUN npm run build

# Prune devDependencies to keep only production packages for the final image
RUN npm prune --omit=dev


# ----- Stage 2: Final Production Image -----
FROM python:3.10-slim

# 1. Install system dependencies for OpenCV and Node.js
# libgl1 and libglib2.0-0 are REQUIRED for OpenCV to work in Docker
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js v22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# 3. Setup Python Identity Service
COPY identity-service/requirements.txt ./identity-service/
RUN pip install --no-cache-dir -r identity-service/requirements.txt
COPY identity-service ./identity-service/

# 4. Setup Node.js Backend from builder stage
WORKDIR /app/backend
# Copy only necessary files: package metadata, node_modules (prod only), prisma schema/migrations, and dist
COPY --from=backend-builder /app/backend/package.json /app/backend/package-lock.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/dist ./dist

# 5. Copy the unified start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

# Expose ports
EXPOSE 3001
EXPOSE 8000

# Start both services
CMD ["./start.sh"]
