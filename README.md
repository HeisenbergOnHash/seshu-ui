# Seshu UI

Frontend for the Seshu loan management app.

- **Production:** https://seshu.pages.dev
- **Backend API:** https://seshu-backend.onrender.com/api

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

Production builds use [`.env.production`](.env.production), which points at the Render backend.

Cloudflare Pages settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable (optional override) | `VITE_API_URL=https://seshu-backend.onrender.com/api` |

SPA routing is handled via [`public/_redirects`](public/_redirects).

## API URL format

`VITE_API_URL` should resolve to the API prefix the app calls (e.g. `/auth/login` → `{base}/auth/login`).

Both of these work:

```env
VITE_API_URL=https://seshu-backend.onrender.com/api
VITE_API_URL=https://seshu-backend.onrender.com
```

If unset, the app falls back to `/api` (Vite dev proxy in development).
