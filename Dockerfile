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

# 4. Setup Node.js Backend
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
# Force installation of devDependencies so NestJS CLI is available for the build
RUN npm ci --include=dev

COPY backend ./

# Generate Prisma Client & Build NextJS
RUN npx prisma generate
RUN npm run build

# 5. Copy the unified start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

# Start both services
CMD ["./start.sh"]
