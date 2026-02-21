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

# MEGA STRIP: Aggressively remove all non-Debian 11 Prisma engines
RUN find node_modules -type f -name "*windows*" -delete \
    && find node_modules -type f -name "*darwin*" -delete \
    && find node_modules -type f -name "*musl*" -delete \
    && find node_modules -type f -name "*rhel*" -delete \
    && find node_modules -type f -name "*linux-arm64*" -delete \
    && find node_modules -type f -name "*debian-10*" -delete


# ----- Stage 2: Build Python Dependencies -----
FROM python:3.10-slim AS python-builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ binutils \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

# 🔥 Pull in the ultra-fast Rust-based 'uv' package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 🚨 CRITICAL FIX 1: Install CPU-only Torch FIRST using 'uv pip'. 
# 'uv' resolves and downloads massive packages up to 100x faster than standard pip.
RUN uv pip install --no-cache torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

COPY identity-service/requirements.txt ./

# 🚨 CRITICAL FIX 2: DeepFace forces the 1GB 'tensorflow' GPU package. 
# We install requirements, explicitly uninstall the GPU bloat, and ensure only 'tensorflow-cpu' remains.
RUN uv pip install --no-cache -r requirements.txt \
    && uv pip uninstall -y tensorflow tensorflow-cpu \
    && uv pip install --no-cache tensorflow-cpu tf-keras \
    && rm -rf /opt/venv/lib/python3.10/site-packages/nvidia* \
    && rm -rf /opt/venv/lib/python3.10/site-packages/triton* \
    && rm -rf /opt/venv/lib/python3.10/site-packages/tensorboard* \
    && find /opt/venv -name "*.so" -exec strip {} \; || true \
    && find /opt/venv -type d -name "__pycache__" -exec rm -rf {} + \
    && find /opt/venv -name "*.pyc" -delete

# Pre-download ML models at build time to prevent massive startup delays/OOM in Railway
RUN python -c "import easyocr; easyocr.Reader(['en'], gpu=False); from deepface import DeepFace; DeepFace.build_model('ArcFace')"


# ----- Stage 3: Final Production Image -----
FROM python:3.10-slim

# Install ONLY runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
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

# Copy pre-downloaded ML models to their expected directories
COPY --from=python-builder /root/.deepface /root/.deepface
COPY --from=python-builder /root/.EasyOCR /root/.EasyOCR

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