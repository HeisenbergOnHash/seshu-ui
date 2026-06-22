const DEFAULT_API_BASE = '/api';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!envUrl?.trim()) {
    return DEFAULT_API_BASE;
  }

  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}
