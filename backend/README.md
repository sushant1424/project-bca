# Wrytera Backend

Django REST API backend for the Wrytera content platform.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 4. Run Development Server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile (requires authentication)

### Signup Request Format
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login Request Format
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

## Features

- **Custom User Model**: Extended with bio, avatar, social links
- **JWT Authentication**: Secure token-based authentication
- **Password Validation**: Strong password requirements
- **CORS Support**: Frontend communication enabled
- **Admin Interface**: Full Django admin integration

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Development

The backend is configured for development with:
- SQLite database
- CORS enabled for frontend
- JWT tokens for authentication
- Comprehensive validation 