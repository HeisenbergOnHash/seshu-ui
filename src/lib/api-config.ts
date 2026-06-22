const LOCAL_API_BASE = '/api';
const PRODUCTION_API_URL = 'https://seshu-backend.onrender.com/api';

function normalizeApiUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') {
    return import.meta.env.DEV;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl?.trim()) {
    return normalizeApiUrl(envUrl);
  }

  if (isLocalDevHost()) {
    return LOCAL_API_BASE;
  }

  return PRODUCTION_API_URL;
}
