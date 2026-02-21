#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting Identity Service (FastAPI) on port 8000..."
cd /app/identity-service
# Run in background
python -m uvicorn main:app --host 127.0.0.1 --port 8000 &

echo "⏳ Waiting 3 seconds for Python models to begin loading..."
sleep 3

echo "🚀 Starting Backend (NestJS)..."
cd /app/backend

echo "🔄 Running database migrations..."
npx prisma db push

echo "🔥 Booting main server..."
node dist/src/main
