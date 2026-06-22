# Seshu UI

Frontend for the Seshu loan management app.

- **Production:** https://seshu.pages.dev
- **Backend API:** https://seshu-backend.onrender.com/api

Production builds call the Render API directly. The backend must allow `https://seshu.pages.dev` via CORS.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. (Optional) Copy env example for overrides:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm run dev
```

The app runs at http://localhost:5173.

By default, local dev proxies `/api` to `http://localhost:8080`. Start the backend locally on port 8080, or set `VITE_API_URL` in `.env` to point at the hosted API:

```env
VITE_API_URL=https://seshu-backend.onrender.com/api
```

## Deploy (Cloudflare Pages)

Production API URL is set in [`.env.production`](.env.production) and baked into the build at compile time:

```env
VITE_API_URL=https://seshu-backend.onrender.com/api
```

There is also a code fallback in [`src/lib/api-config.ts`](src/lib/api-config.ts) so production always targets Render even if the env var is missing.

Cloudflare Pages settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |

`VITE_API_URL` in the Cloudflare dashboard is optional (`.env.production` in the repo is the source of truth). If you change it, trigger a **new deployment** — env vars are not applied to existing builds.

SPA routing uses [`public/_redirects`](public/_redirects):

```txt
/*  /index.html  200
```

## After deploy

1. Hard-refresh https://seshu.pages.dev or clear the PWA/service worker cache (old JS may be cached).
2. Login should request `https://seshu-backend.onrender.com/api/auth/login` (not `seshu.pages.dev/api/...`).

## API URL format

`VITE_API_URL` should resolve to the API prefix the app calls (e.g. `/auth/login` → `{base}/auth/login`).

Both of these work:

```env
VITE_API_URL=https://seshu-backend.onrender.com/api
VITE_API_URL=https://seshu-backend.onrender.com
```

In development, if unset, the app falls back to `/api` (Vite dev proxy).
