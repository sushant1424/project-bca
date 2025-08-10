#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from posts.models import Post, Category
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

def create_sample_data():
    print("🚀 Restoring database with sample data...")
    
    # Create users
    print("👤 Creating users...")
    users_data = [
        {'username': 'demo_user', 'email': 'demo@example.com', 'password': 'demo123'},
        {'username': 'editor', 'email': 'editor@example.com', 'password': 'editor123'},
        {'username': 'writer', 'email': 'writer@example.com', 'password': 'writer123'},
    ]
    
    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['username'].title(),
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
            # Create token
            Token.objects.get_or_create(user=user)
            print(f"✅ Created user: {user.username}")
        users.append(user)
    
    # Create categories
    print("📂 Creating categories...")
    categories_data = [
        {'name': 'Technology', 'slug': 'technology'},
        {'name': 'Lifestyle', 'slug': 'lifestyle'},
        {'name': 'Travel', 'slug': 'travel'},
        {'name': 'Food', 'slug': 'food'},
        {'name': 'Health', 'slug': 'health'},
        {'name': 'Business', 'slug': 'business'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name']}
        )
        if created:
            print(f"✅ Created category: {category.name}")
        categories.append(category)
    
    # Create posts
    print("📝 Creating posts...")
    posts_data = [
        {
            'title': 'Welcome to Wrytera',
            'content': 'This is a demo post. Start exploring our platform by creating your own content!',
            'excerpt': 'Welcome post for new users',
            'author': users[0],
            'category': categories[0],
        },
        {
            'title': 'Getting Started with Writing',
            'content': 'Learn how to create amazing content on our platform. Sign up to start your writing journey!',
            'excerpt': 'Guide for new writers',
            'author': users[1],
            'category': categories[0],
        },
        {
            'title': 'The Future of Technology',
            'content': 'Exploring the latest trends in technology and how they impact our daily lives. From AI to blockchain, discover what\'s next.',
            'excerpt': 'Latest tech trends and innovations',
            'author': users[1],
            'category': categories[0],
        },
        {
            'title': 'Healthy Living Tips',
            'content': 'Simple tips for maintaining a healthy lifestyle. Exercise, nutrition, and mental wellness all play important roles.',
            'excerpt': 'Tips for better health and wellness',
            'author': users[2],
            'category': categories[4],
        },
        {
            'title': 'Travel Adventures',
            'content': 'Share your travel experiences and discover new destinations. From hidden gems to popular tourist spots.',
            'excerpt': 'Discover amazing travel destinations',
            'author': users[2],
            'category': categories[2],
        },
        {
            'title': 'Business Insights',
            'content': 'Latest trends in business and entrepreneurship. Learn from successful entrepreneurs and industry experts.',
            'excerpt': 'Business tips and entrepreneurship',
            'author': users[0],
            'category': categories[5],
        },
    ]
    
    for post_data in posts_data:
        post, created = Post.objects.get_or_create(
            title=post_data['title'],
            defaults={
                'content': post_data['content'],
                'excerpt': post_data['excerpt'],
                'author': post_data['author'],
                'category': post_data['category'],
                'is_published': True,
            }
        )
        if created:
            print(f"✅ Created post: {post.title}")
    
    print("🎉 Database restoration complete!")
    print(f"📊 Summary:")
    print(f"   Users: {User.objects.count()}")
    print(f"   Categories: {Category.objects.count()}")
    print(f"   Posts: {Post.objects.count()}")
    print(f"   Tokens: {Token.objects.count()}")
    
    print("\n🔑 Login credentials:")
    for user_data in users_data:
        user = User.objects.get(username=user_data['username'])
        token = Token.objects.get(user=user)
        print(f"   {user.username}: {user_data['password']} (Token: {token.key[:20]}...)")

if __name__ == '__main__':
    create_sample_data()
