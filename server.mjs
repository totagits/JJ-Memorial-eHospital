import path from 'node:path';
import compression from 'compression';
import express from 'express';
import pg from 'pg';
import { migrateRegistry, registryRoutes } from './registry.mjs';

const app = express();
const dist = path.join(import.meta.dirname, 'dist');
const database = process.env.DATABASE_URL ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 2000,
  query_timeout: 2000,
  statement_timeout: 2000,
  max: 2,
}) : null;

database?.on('error', () => console.error('Idle PostgreSQL connection failed'));

app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.set({
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});
app.use(compression());

app.get('/health/ready', async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    if (!database) return response.status(503).json({ status: 'unavailable' });
    await database.query('SELECT 1');
    response.json({ status: 'ready' });
  } catch {
    response.status(503).json({ status: 'unavailable' });
  }
});

const registryOrigin = process.env.COOLIFY_FQDN === 'jjmemorial-staging.totag.network'
  || process.env.COOLIFY_URL === 'https://jjmemorial-staging.totag.network'
  ? 'https://jjmemorial-staging.totag.network' : process.env.REGISTRY_ORIGIN;
if (registryOrigin && database) await migrateRegistry(database);
app.use('/api/registry', registryRoutes(database, registryOrigin));

app.use('/assets', express.static(path.join(dist, 'assets'), {
  immutable: true,
  maxAge: '1y',
  fallthrough: false,
}));
app.use(express.static(dist));
app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html')));

app.listen(Number(process.env.PORT ?? 80), '0.0.0.0');
