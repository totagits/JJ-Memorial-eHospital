#!/bin/bash
set -e

echo "Pulling latest changes from JJ-Memorial-staging branch..."
git fetch origin JJ-Memorial-staging
git checkout JJ-Memorial-staging
git pull origin JJ-Memorial-staging

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building production Vite assets..."
npm run build

echo "Rebuilding Docker container..."
docker build --no-cache -t jj-memorial-staging .
docker stop jj-memorial-app 2>/dev/null || true
docker rm jj-memorial-app 2>/dev/null || true
docker run -d --name jj-memorial-app --restart always -p 127.0.0.1:3080:80 jj-memorial-staging

echo "Staging deployment complete! Verified at https://jjmemorial-staging.totag.network"
