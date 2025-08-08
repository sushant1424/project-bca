import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from posts.models import Post, Category, Comment, Follow, PostView
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

def create_demo_data():
    print("Creating demo data...")
    
    # Create categories
    categories_data = [
        {'name': 'Technology', 'slug': 'technology', 'color': '#3B82F6'},
        {'name': 'Health & Wellness', 'slug': 'health-wellness', 'color': '#10B981'},
        {'name': 'Travel', 'slug': 'travel', 'color': '#F59E0B'},
        {'name': 'Food & Cooking', 'slug': 'food-cooking', 'color': '#EF4444'},
        {'name': 'Personal Growth', 'slug': 'personal-growth', 'color': '#8B5CF6'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories.append(category)
        if created:
            print(f"Created category: {category.name}")
    
    # Create demo users
    users_data = [
        {'username': 'alex', 'email': 'alex@demo.com', 'first_name': 'Alex', 'last_name': 'Johnson'},
        {'username': 'sarah', 'email': 'sarah@demo.com', 'first_name': 'Sarah', 'last_name': 'Chen'},
        {'username': 'mike', 'email': 'mike@demo.com', 'first_name': 'Mike', 'last_name': 'Davis'},
        {'username': 'emma', 'email': 'emma@demo.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
        {'username': 'david', 'email': 'david@demo.com', 'first_name': 'David', 'last_name': 'Brown'},
        {'username': 'lisa', 'email': 'lisa@demo.com', 'first_name': 'Lisa', 'last_name': 'Garcia'},
    ]
    
    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                **user_data,
                'password': make_password('demo123'),
            }
        )
        users.append(user)
        if created:
            print(f"Created user: {user.username}")
    
    # Create posts
    posts_data = [
        {
            'title': 'The Future of AI in Web Development',
            'content': 'Artificial Intelligence is revolutionizing how we build web applications. From automated code generation to intelligent debugging, AI tools are becoming indispensable for modern developers. In this comprehensive guide, I explore the latest AI-powered development tools that are changing the game.',
            'category': 'technology'
        },
        {
            'title': 'Building Mental Resilience in a Digital Age',
            'content': 'Our constant connection to digital devices is creating unprecedented challenges for mental health. While technology offers incredible benefits, it also contributes to anxiety, depression, and attention disorders. Building mental resilience has never been more important.',
            'category': 'health-wellness'
        },
        {
            'title': 'Solo Travel: A Journey to Self-Discovery',
            'content': 'Solo travel is one of the most transformative experiences you can have. It pushes you out of your comfort zone, builds confidence, and offers unparalleled opportunities for self-reflection and personal growth.',
            'category': 'travel'
        },
        {
            'title': 'The Art of Fermentation: Ancient Wisdom for Modern Health',
            'content': 'Fermentation is humanity oldest form of food preservation, and it is experiencing a remarkable renaissance. From kimchi to kombucha, fermented foods are not only delicious but also incredibly beneficial for our health.',
            'category': 'food-cooking'
        },
        {
            'title': 'The Power of Morning Routines',
            'content': 'How you start your morning sets the tone for your entire day. A well-designed morning routine can increase productivity, reduce stress, and create a sense of accomplishment before the day challenges begin.',
            'category': 'personal-growth'
        },
    ]
    
    posts = []
    for i, post_data in enumerate(posts_data):
        author = users[i % len(users)]
        category = next((c for c in categories if c.slug == post_data['category']), categories[0])
        
        days_ago = random.randint(1, 10)
        created_time = timezone.now() - timedelta(days=days_ago)
        
        post, created = Post.objects.get_or_create(
            title=post_data['title'],
            defaults={
                'author': author,
                'content': post_data['content'],
                'excerpt': post_data['content'][:200] + '...',
                'category': category,
                'created_at': created_time,
            }
        )
        posts.append(post)
        if created:
            print(f"Created post: {post.title}")
    
    # Create some engagement
    for post in posts:
        # Random likes
        num_likes = random.randint(2, 8)
        likers = random.sample(users, min(num_likes, len(users)))
        for user in likers:
            if user != post.author:
                post.likes.add(user)
        
        # Random views
        num_views = random.randint(10, 50)
        for _ in range(num_views):
            viewer = random.choice(users + [None])
            PostView.objects.get_or_create(
                post=post,
                user=viewer,
                ip_address=f"192.168.1.{random.randint(1, 254)}" if not viewer else None,
            )
    
    # Create some follows
    for user in users:
        num_follows = random.randint(1, 3)
        potential_follows = [u for u in users if u != user]
        follows = random.sample(potential_follows, min(num_follows, len(potential_follows)))
        
        for followed_user in follows:
            Follow.objects.get_or_create(
                follower=user,
                following=followed_user
            )
    
    print(f"\n✅ Demo data created successfully!")
    print(f"Users: {len(users)} (Password: demo123)")
    print(f"Categories: {len(categories)}")
    print(f"Posts: {len(posts)}")
    print(f"Total likes: {sum(post.like_count() for post in posts)}")
    print(f"Total views: {PostView.objects.count()}")
    print(f"Total follows: {Follow.objects.count()}")

if __name__ == '__main__':
    create_demo_data()
