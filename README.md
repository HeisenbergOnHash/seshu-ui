# Seshu UI

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create your env file from the example:

```bash
cp .env.example .env
```

3. Set your backend URL in `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

You can replace this with any backend base URL, for example:
- `http://localhost:8080/api`
- `https://api.yourdomain.com/api`

4. Start the app:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.
