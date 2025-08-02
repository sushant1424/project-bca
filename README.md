# Wrytera - Social Media & Blogging Platform

A full-stack social media and blogging platform built with React and Django, featuring modern UI, real-time interactions, and comprehensive user management.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration, login, and JWT-based authentication
- **Post Management**: Create, edit, delete, and publish blog posts with rich content
- **Social Interactions**: Like, comment, repost, and follow other users
- **Search & Discovery**: Advanced search functionality with category filtering
- **User Profiles**: Customizable profiles with image upload and bio management
- **Dashboard**: Personal dashboard with post analytics and user statistics

### Advanced Features
- **Trending Posts**: Algorithm-based trending content discovery
- **Categories**: Organized content categorization system
- **Following System**: Follow users and curated following feed
- **Library & Favorites**: Personal content organization
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS
- **Real-time Updates**: Dynamic content updates and notifications

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **React Router 7.7.1** - Client-side routing and navigation
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful icon library

### Backend
- **Django 5.2.2** - Robust Python web framework
- **Django REST Framework 3.14.0** - Powerful API development
- **SimpleJWT** - JSON Web Token authentication
- **Pillow** - Image processing and manipulation
- **SQLite** - Lightweight database (development)

## 📁 Project Structure

```
project-bca/
├── backend/
│   ├── authentication/     # User auth and profile management
│   ├── posts/             # Post creation and social features
│   ├── core/              # Django settings and configuration
│   ├── media/             # User uploaded files
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── config/        # Configuration files
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json       # Node.js dependencies
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://127.0.0.1:8000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/upload-profile-image/` - Upload profile image

### Posts Endpoints
- `GET /api/posts/` - List all posts (with pagination)
- `POST /api/posts/` - Create new post
- `GET /api/posts/{id}/` - Get specific post
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post
- `POST /api/posts/{id}/like/` - Like/unlike post
- `GET /api/posts/{id}/comments/` - Get post comments
- `POST /api/posts/{id}/comments/` - Add comment

### Social Features
- `POST /api/posts/{id}/repost/` - Repost content
- `POST /api/users/{id}/follow/` - Follow/unfollow user
- `GET /api/posts/trending/` - Get trending posts
- `GET /api/posts/search/` - Search posts
- `GET /api/posts/categories/` - Get post categories

## 🎨 UI Components

### Key Components
- **Navbar** - Navigation with search and user menu
- **Sidebar** - Main navigation and quick actions
- **PostList** - Dynamic post feed with infinite scroll
- **PostDetail** - Detailed post view with comments
- **WritePage** - Rich post creation and editing
- **Dashboard** - User analytics and post management
- **ProfilePage** - User profile display and editing

### Design System
- **Colors**: Modern color palette with dark/light theme support
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent spacing using Tailwind utilities
- **Components**: Reusable, accessible UI components

## 🔧 Configuration

### Environment Variables

Create `.env` files based on the provided examples:

**Frontend (.env)**
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Backend (environment variables)**
```python
# In settings.py
SECRET_KEY = 'your-secret-key'
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
```

## 🚀 Deployment

### Production Considerations
- Set `DEBUG = False` in Django settings
- Configure proper database (PostgreSQL recommended)
- Set up media file serving (AWS S3, Cloudinary)
- Configure CORS settings for production domains
- Use environment variables for sensitive data
- Set up proper logging and monitoring

### Build Commands
```bash
# Frontend build
cd frontend
npm run build

# Backend static files
cd backend
python manage.py collectstatic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Django team for the robust backend framework
- Tailwind CSS for the utility-first CSS approach
- All contributors and open-source libraries used

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ for the developer community**
