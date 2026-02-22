# ----- Stage 1: Build Backend -----
FROM node:22-bullseye-slim AS backend-builder
WORKDIR /app/backend
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY backend ./
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

# ----- Stage 2: Build Python Dependencies -----
FROM python:3.10-slim AS python-builder
WORKDIR /app
# Dummy copy to prevent OOM by forcing sequential builds
COPY --from=backend-builder /app/backend/package.json /tmp/dummy.json

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ binutils libgl1 libglib2.0-0 libxcb1 wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV UV_EXTRA_INDEX_URL="https://download.pytorch.org/whl/cpu"

COPY identity-service/requirements.txt ./

# 🚨 THE GOLDEN FIX: Pinning the exact compatible trio to prevent all previous crashes
RUN uv pip install --no-cache torch torchvision torchaudio \
    && uv pip install --no-cache -r requirements.txt --extra-index-url https://pypi.org/simple \
    && uv pip uninstall -y tensorflow tensorflow-cpu keras tf-keras tensorboard nvidia-pyindex || true \
    && rm -rf /opt/venv/lib/python3.10/site-packages/tensorflow* \
    && rm -rf /opt/venv/lib/python3.10/site-packages/keras* \
    && rm -rf /opt/venv/lib/python3.10/site-packages/nvidia* \
    && uv pip install --no-cache "tensorflow-cpu==2.15.1" "tf-keras==2.15.0" "protobuf==3.20.3" \
    && find /opt/venv -name "*.so" -exec strip --strip-unneeded {} + || true \
    && find /opt/venv -type d -name "__pycache__" -exec rm -rf {} + || true

# Pre-download models with resume support
RUN mkdir -p /root/.deepface/weights \
    && wget -c -O /root/.deepface/weights/arcface_weights.h5 https://github.com/serengil/deepface_models/releases/download/v1.0/arcface_weights.h5 \
    && python -c "import os; os.environ['TF_CPP_MIN_LOG_LEVEL']='3'; import easyocr; easyocr.Reader(['en'], gpu=False); from deepface import DeepFace; DeepFace.build_model('ArcFace')"

# ----- Stage 3: Final Production Image -----
FROM python:3.10-slim
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libxcb1 openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=backend-builder /usr/local/bin/node /usr/local/bin/
COPY --from=backend-builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
WORKDIR /app
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY --from=python-builder /root/.deepface /root/.deepface
COPY --from=python-builder /root/.EasyOCR /root/.EasyOCR
COPY identity-service ./identity-service/
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/package.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/dist ./dist
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh
EXPOSE 3001
EXPOSE 8000
CMD ["./start.sh"]