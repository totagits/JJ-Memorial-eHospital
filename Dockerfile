FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server.mjs registry.mjs provision-staging-staff.mjs ./
COPY migrations/ ./migrations/
COPY --from=build /app/dist/ ./dist/

USER node
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 80) + '/health/ready').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server.mjs"]
