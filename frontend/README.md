# Frontend – React (Vite)

React 19 + Vite + Tailwind UI for the Wrytera platform.

## Run locally
```bash
cd frontend
npm install
# API base (local)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev   # http://localhost:5173
```

## Build
```bash
npm run build
npm run preview
```

## Configuration
- Base API URL: `VITE_API_BASE_URL` (reads from `.env` or hosting env)
- API utilities: `src/config/api.js`
