#!/bin/sh
set -e

# Run migrations
npx prisma db push

# Build the project (if not already built by Nixpacks)
if [ ! -d "dist" ]; then
  npm run build
fi

# Start the application
node dist/main
