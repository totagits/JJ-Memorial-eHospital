#!/bin/bash
set -e

echo "Pulling latest changes from staging..."
git checkout staging
git pull origin staging

echo "Installing dependencies..."
npm install react-is --save --legacy-peer-deps
npm install --legacy-peer-deps

echo "Rebuilding Docker container..."
docker build --no-cache -t jj-memorial-staging .
docker stop jj-memorial-app 2>/dev/null || true
docker rm jj-memorial-app 2>/dev/null || true
docker run -d --name jj-memorial-app --restart always -p 127.0.0.1:3080:80 jj-memorial-staging

echo "Staging deployment complete!"
