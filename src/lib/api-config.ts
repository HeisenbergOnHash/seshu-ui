const DEFAULT_API_BASE = '/api';
const PRODUCTION_API_URL = 'https://seshu-backend.onrender.com/api';

function normalizeApiUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl?.trim()) {
    return normalizeApiUrl(envUrl);
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  return DEFAULT_API_BASE;
}
