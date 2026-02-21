# ----- Stage 1: Build Backend -----
FROM node:22-bullseye-slim AS backend-builder
WORKDIR /app/backend

# Install openssl (Required by Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY backend ./

RUN npx prisma generate
RUN npm run build

# Prune dev dependencies
RUN npm prune --omit=dev && npm cache clean --force

# STRIP SIZE: Railway strict 4GB limit. Remove unused OS binaries from Prisma (~150MB saved)
RUN rm -rf node_modules/@prisma/engines/*windows* \
    && rm -rf node_modules/@prisma/engines/*darwin* \
    && rm -rf node_modules/@prisma/engines/*debian-10*


# ----- Stage 2: Build Python Dependencies -----
FROM python:3.10-slim AS python-builder
WORKDIR /app

# Install build dependencies and 'binutils' for the strip command
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ binutils && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY identity-service/requirements.txt ./

# MASSIVE SIZE REDUCTION FOR RAILWAY:
# 1. Force CPU versions for Torch
# 2. DeepFace/EasyOCR silently pull NVIDIA GPU drivers (~2.5GB). We delete them aggressively.
# 3. Strip debug symbols from heavy C++ ML libraries (~300MB saved)
# 4. Delete python bytecode caches (~150MB saved)
RUN pip install --no-cache-dir --default-timeout=1000 \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt \
    && rm -rf /opt/venv/lib/python3.10/site-packages/nvidia* \
    && rm -rf /opt/venv/lib/python3.10/site-packages/triton* \
    && find /opt/venv -name "*.so" -exec strip {} \; || true \
    && find /opt/venv -type d -name "__pycache__" -exec rm -rf {} + \
    && find /opt/venv -name "*.pyc" -delete \
    && rm -rf /root/.cache/pip


# ----- Stage 3: Final Production Image -----
FROM python:3.10-slim

# Install ONLY runtime dependencies, wipe apt caches completely
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy Node.js runtime from builder
COPY --from=backend-builder /usr/local/bin/node /usr/local/bin/
COPY --from=backend-builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /app

# Copy optimized Python virtual environment
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy python code
COPY identity-service ./identity-service/

# Copy Node.js backend
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/package.json /app/backend/package-lock.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/dist ./dist

WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3001
EXPOSE 8000

CMD ["./start.sh"]