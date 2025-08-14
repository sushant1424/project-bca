#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from posts.models import Post, Comment
import random

User = get_user_model()

def create_demo_interactions():
    users = list(User.objects.all())
    posts = list(Post.objects.all())
    
    if len(users) < 3 or len(posts) < 3:
        print("Need at least 3 users and 3 posts for meaningful collaborative filtering")
        return
    
    print(f"Creating demo interactions with {len(users)} users and {len(posts)} posts...")
    
    # Create overlapping like patterns for collaborative filtering
    for i, post in enumerate(posts):
        # Each post gets liked by 2-4 users with some overlap
        num_likers = random.randint(2, min(4, len(users)))
        likers = random.sample(users, num_likers)
        
        for user in likers:
            if not post.likes.filter(id=user.id).exists():
                post.likes.add(user)
                print(f"✓ {user.username} liked '{post.title[:30]}...'")
    
    # Add some comments for additional collaborative signals
    for post in posts[:min(6, len(posts))]:
        # 1-2 comments per post
        num_commenters = random.randint(1, 2)
        commenters = random.sample(users, num_commenters)
        
        for user in commenters:
            if not Comment.objects.filter(post=post, author=user).exists():
                Comment.objects.create(
                    post=post,
                    author=user,
                    content=f"Great insights on {post.category.name if post.category else 'this topic'}! Really enjoyed reading this."
                )
                print(f"✓ {user.username} commented on '{post.title[:30]}...'")
    
    # Print final stats
    total_likes = sum(post.likes.count() for post in Post.objects.all())
    total_comments = Comment.objects.count()
    
    print(f"\n🎉 Demo data created successfully!")
    print(f"📊 Stats:")
    print(f"   - Total likes: {total_likes}")
    print(f"   - Total comments: {total_comments}")
    print(f"   - Users: {len(users)}")
    print(f"   - Posts: {len(posts)}")
    print(f"\n✅ Collaborative filtering should now work with this interaction data!")

if __name__ == "__main__":
    create_demo_interactions()
