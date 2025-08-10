import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from posts.models import Post, Category
from rest_framework.authtoken.models import Token

# Create demo user
user, created = User.objects.get_or_create(
    username='demo_user',
    defaults={'email': 'demo@example.com', 'first_name': 'Demo'}
)
if created:
    user.set_password('demo123')
    user.save()

# Create token
token, _ = Token.objects.get_or_create(user=user)

# Create categories
tech_cat, _ = Category.objects.get_or_create(name='Technology', slug='technology')
life_cat, _ = Category.objects.get_or_create(name='Lifestyle', slug='lifestyle')

# Create posts
Post.objects.get_or_create(
    title='Welcome to Wrytera',
    defaults={
        'content': 'This is a demo post. Start exploring our platform by creating your own content!',
        'excerpt': 'Welcome post for new users',
        'author': user,
        'category': tech_cat,
        'is_published': True
    }
)

Post.objects.get_or_create(
    title='Getting Started with Writing',
    defaults={
        'content': 'Learn how to create amazing content on our platform. Sign up to start your writing journey!',
        'excerpt': 'Guide for new writers',
        'author': user,
        'category': life_cat,
        'is_published': True
    }
)

print("✅ Data restored!")
print(f"Users: {User.objects.count()}")
print(f"Posts: {Post.objects.count()}")
print(f"Categories: {Category.objects.count()}")
print(f"Login: demo_user / demo123")
print(f"Token: {token.key}")
