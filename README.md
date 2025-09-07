# Wrytera – Social Blogging & Micro‑Community Platform

A full‑stack social/blogging platform built with React (Vite) and Django REST Framework. Users can write posts with rich text, explore trending content, follow creators, like/comment/save posts, and view personalized recommendations.

This repository is organized for reviewers to quickly understand the product, scan code, and run it locally in minutes.

## Highlights
- Modern React 19 UI with Vite + Tailwind 4
- Django 5 API with JWT/Token auth, CORS, and production‑ready settings
- Content features: posts, comments, likes, saves, categories, trending
- Recommendation helpers (trending topics, suggested users/posts)
- Clean component/context structure and API layer
- Deployment‑ready (Railway/Vercel/Netlify), but easy local run (SQLite)

## Tech Stack
- Frontend: React 19, Vite, Tailwind, Radix UI, Lucide Icons
- Backend: Django 5, Django REST Framework, SimpleJWT, CORS, Whitenoise
- Database: SQLite for local; PostgreSQL in production

## Monorepo Structure
```
project-bca/
  frontend/                # React app (Vite)
  backend/                 # Django project (apps: authentication, posts)
  DEPLOYMENT_GUIDE.md      # Cloud deployment notes (Railway/Vercel/Netlify)
```

## Run Locally (5–10 minutes)
Prereqs: Python 3.11+ and Node 18+ (Node 20 recommended)

### 1) Backend (Django API)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# env (SQLite local by default)
cp .env.example .env  # optional – defaults are sensible for local

python manage.py migrate
python manage.py createsuperuser   # optional
python manage.py runserver 0.0.0.0:8000
```
API will be at http://localhost:8000

### 2) Frontend (React/Vite)
```bash
cd frontend
npm install
# Point frontend to your local API
# Linux/Mac:  echo "VITE_API_BASE_URL=http://localhost:8000" > .env
# Windows:    echo VITE_API_BASE_URL=http://localhost:8000 > .env

npm run dev   # http://localhost:5173
```

## Environment Variables
### Backend (`backend/.env` – optional for local)
```
# Local development defaults work without .env
SECRET_KEY=dev-secret-key-change-in-prod
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```
In production (Railway), set PostgreSQL `DATABASE_URL` and switch `DEBUG=False`.

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Scripts
### Backend
- `python manage.py migrate` – apply migrations
- `python manage.py runserver` – start API on 8000
- `python manage.py createsuperuser` – admin user

### Frontend
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built artifacts

## Notable Code
- API endpoints registered in `backend/core/urls.py`
- Core models and business logic in `backend/posts/` and `backend/authentication/`
- React routing/components in `frontend/src/components/`
- Frontend API base in `frontend/src/config/api.js` (uses `VITE_API_BASE_URL`)

## Production Notes
- The repo contains `DEPLOYMENT_GUIDE.md` with step‑by‑step Railway + Vercel/Netlify instructions
- Backend uses Whitenoise for static files and CORS/CSRF hardening

## Screenshots / Demo
You can attach your screenshots or a short demo GIF here for hiring managers.

---
If you run into any issues locally, please open an issue or contact me.