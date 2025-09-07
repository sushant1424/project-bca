# Backend – Django REST API

Django 5 + DRF API for posts, comments, likes, saves, categories and auth.

## Quick start
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: backend/.env (SQLite works without)
# SECRET_KEY=dev
# DEBUG=True
# ALLOWED_HOSTS=localhost,127.0.0.1
# CORS_ALLOWED_ORIGINS=http://localhost:5173
# CSRF_TRUSTED_ORIGINS=http://localhost:5173

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Useful commands
- `python manage.py createsuperuser`
- `python manage.py collectstatic` (prod)

## Deployment
- Railway: set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`
- Start command (Railway): `python manage.py migrate && python manage.py collectstatic --noinput && gunicorn core.wsgi` 