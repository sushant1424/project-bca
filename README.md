# Wrytera 

A full‑stack social/blogging platform built with React (Vite) and Django REST Framework. Users can write posts with rich text, explore trending content, follow creators, like/comment/save posts, and view personalized recommendations.

## Highlights
- Modern React 19 UI with Vite + Tailwind 4
- Django 5 API with JWT/Token auth, CORS, and production‑ready settings
- Content features: posts, comments, likes, saves, categories, trending
- Recommendation helpers (trending topics, suggested users/posts)


## Tech Stack
- Frontend: React 19, Vite, Tailwind, Radix UI, Lucide Icons
- Backend: Django 5, Django REST Framework, SimpleJWT, CORS
- Database: SQLite for local; PostgreSQL in production

## Structure
```
project-bca/
  frontend/                # React app (Vite)
  backend/                 # Django project (apps: authentication, posts)
```

## Run Locally 
Prereqs: Python 3.11+ and Node 18+ 

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

## Screenshots / Demo
<img width="946" height="431" alt="image" src="https://github.com/user-attachments/assets/2bf4bfd3-9a74-4f62-ac52-a53fb22bcbea" />
<img width="947" height="430" alt="image" src="https://github.com/user-attachments/assets/8f8b59f5-3c93-4add-a2f9-f28252a91a22" />
<img width="905" height="409" alt="image" src="https://github.com/user-attachments/assets/08b92c98-fd31-48c4-ab1a-87574cba6bc3" />
<img width="788" height="358" alt="image" src="https://github.com/user-attachments/assets/d1a5b478-ef86-4960-a106-c88acf682908" />




---
If you run into any issues locally, please open an issue or contact me.
