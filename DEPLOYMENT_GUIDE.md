# 🚀 Wrytera Deployment Guide - FREE HOSTING

## Overview
This guide will help you deploy your Wrytera project for **FREE** using:
- **Frontend**: Netlify (Free tier: 100GB bandwidth, custom domain)
- **Backend**: Railway (Free tier: $5 credit monthly)
- **Database**: PostgreSQL (included with Railway)

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Netlify account (sign up at netlify.com)

---

## 🔧 STEP 1: Prepare Your Repository

### 1.1 Initialize Git and Push to GitHub
```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - Wrytera project ready for deployment"

# Create a new repository on GitHub named 'wrytera-project'
git remote add origin https://github.com/YOUR_USERNAME/wrytera-project.git
git branch -M main
git push -u origin main
```

---

## 🖥️ STEP 2: Deploy Backend to Railway

### 2.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `wrytera-project` repository
6. Select "backend" as the root directory

### 2.2 Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```env
SECRET_KEY=django-insecure-your-super-long-secret-key-here-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=*.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend-name.netlify.app,http://localhost:5174
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 2.3 Railway Auto-Setup
Railway will automatically:
- ✅ Install Python dependencies
- ✅ Set up PostgreSQL database
- ✅ Run Django migrations
- ✅ Start server with Gunicorn
- ✅ Provide you with a URL like: `https://your-app-name.railway.app`

### 2.4 Create Superuser (Optional)
In Railway dashboard, go to "Deployments" → "View Logs" → "Terminal":
```bash
python manage.py createsuperuser
```

---

## 🌐 STEP 3: Deploy Frontend to Netlify

### 3.1 Update API Configuration
Before deploying, update your backend URL in the frontend:

1. Copy your Railway backend URL (e.g., `https://your-app-name.railway.app`)
2. Update `frontend/netlify.toml`:
```toml
[context.production.environment]
  VITE_API_BASE_URL = "https://your-actual-railway-url.railway.app"
```

### 3.2 Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click "Deploy site"

### 3.3 Configure Environment Variables in Netlify
In Netlify dashboard, go to Site settings → Environment variables:
```env
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
```

### 3.4 Update CORS Settings
Update your Railway backend environment variables:
```env
CORS_ALLOWED_ORIGINS=https://your-netlify-site-name.netlify.app,http://localhost:5174
ALLOWED_HOSTS=*.railway.app,your-railway-app-name.railway.app
```

---

## 🔄 STEP 4: Final Configuration

### 4.1 Update Backend CORS
In Railway, update your environment variables with the actual Netlify URL:
```env
CORS_ALLOWED_ORIGINS=https://amazing-wrytera-123abc.netlify.app
```

### 4.2 Test Your Deployment
1. Visit your Netlify frontend URL
2. Try creating an account
3. Test posting, liking, following features
4. Check that all API calls work properly

---

## 🎯 STEP 5: Custom Domain (Optional)

### 5.1 Frontend Custom Domain
In Netlify dashboard:
1. Go to Domain settings
2. Add custom domain (e.g., `wrytera.com`)
3. Configure DNS settings as instructed

### 5.2 Backend Custom Domain
In Railway dashboard:
1. Go to Settings → Domains
2. Add custom domain (e.g., `api.wrytera.com`)

---

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`
   - Check that URLs don't have trailing slashes

2. **Database Connection Issues**
   - Railway automatically provides `DATABASE_URL`
   - Ensure migrations ran successfully

3. **Static Files Not Loading**
   - Whitenoise is configured in settings
   - Run `python manage.py collectstatic` if needed

4. **Build Failures**
   - Check Railway/Netlify build logs
   - Ensure all dependencies are in requirements.txt/package.json

### Useful Commands:
```bash
# Check Railway logs
railway logs

# Redeploy on Railway
railway up

# Check Netlify build logs
# Available in Netlify dashboard under "Deploys"
```

---

## 📊 Free Tier Limits

### Railway (Backend)
- ✅ $5 monthly credit (enough for small projects)
- ✅ PostgreSQL database included
- ✅ Custom domains
- ✅ Automatic deployments

### Netlify (Frontend)
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Custom domains
- ✅ Automatic deployments from Git

---

## 🎉 Success!

Your Wrytera project is now live and accessible worldwide for FREE!

**Frontend**: `https://your-site-name.netlify.app`
**Backend**: `https://your-app-name.railway.app`
**Admin Panel**: `https://your-app-name.railway.app/admin`

Perfect for your BCA pre-viva presentation! 🎓
