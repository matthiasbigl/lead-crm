#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push --force 2>&1 || echo "Migration warning (may be first run)"

echo "Starting server on port ${PORT:-3000}..."
exec node build/index.js
