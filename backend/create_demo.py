import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from posts.models import Category, Post, Comment, Like, Follow, PostView
from django.utils import timezone
from django.utils.text import slugify

User = get_user_model()

def create_demo_data():
    print("Creating demo data...")
    
    # Clear existing data
    PostView.objects.all().delete()
    Like.objects.all().delete()
    Comment.objects.all().delete()
    Follow.objects.all().delete()
    Post.objects.all().delete()
    Category.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    
    # Create categories
    categories_data = [
        "Technology", "Lifestyle", "Business", "Creative", 
        "Science", "Education", "Entertainment", "Food"
    ]
    
    categories = {}
    for name in categories_data:
        category = Category.objects.create(
            name=name,
            slug=slugify(name),
            description=f"Posts about {name.lower()}"
        )
        categories[name] = category
        print(f"Created category: {name}")
    
    # Create demo users
    users_data = [
        {"username": "alex_tech", "email": "alex@demo.com", "first_name": "Alex", "last_name": "Johnson"},
        {"username": "sarah_writer", "email": "sarah@demo.com", "first_name": "Sarah", "last_name": "Chen"},
        {"username": "mike_biz", "email": "mike@demo.com", "first_name": "Mike", "last_name": "Rodriguez"},
        {"username": "emma_design", "email": "emma@demo.com", "first_name": "Emma", "last_name": "Thompson"},
        {"username": "david_sci", "email": "david@demo.com", "first_name": "David", "last_name": "Kim"},
        {"username": "lisa_food", "email": "lisa@demo.com", "first_name": "Lisa", "last_name": "Martinez"}
    ]
    
    users = {}
    for user_data in users_data:
        user = User.objects.create_user(
            username=user_data["username"],
            email=user_data["email"],
            password="demo123",
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            bio=f"Demo user {user_data['first_name']}"
        )
        users[user_data["username"]] = user
        print(f"Created user: {user_data['username']}")
    
    # Create rich posts
    posts_data = [
        {
            "title": "The Future of AI: Transforming Industries in 2024",
            "content": """# The AI Revolution is Here

Artificial Intelligence is reshaping industries today. From healthcare to finance, AI drives innovation.

## Key Trends in 2024

### Generative AI Goes Mainstream
Large Language Models revolutionize content creation and problem-solving.

### AI in Healthcare
- Diagnosing diseases with 95% accuracy
- Predicting patient outcomes
- Accelerating drug discovery

### Autonomous Systems
Self-driving cars and robotics become more sophisticated.

## Business Impact
- 40% increase in productivity
- 25% reduction in costs
- Enhanced customer experiences

The future belongs to those who embrace AI today.""",
            "author": "alex_tech",
            "categories": ["Technology", "Business"],
            "is_premium": True,
            "premium_price": 4.99
        },
        {
            "title": "Building a Sustainable Morning Routine",
            "content": """# Transform Your Mornings, Transform Your Life

A well-crafted morning routine is the foundation of productivity.

## The Science Behind Morning Routines
People with consistent routines are 23% more productive.

## The 5-Step Framework

### Step 1: Prepare the Night Before
- Lay out clothes
- Prepare breakfast
- Set consistent bedtime

### Step 2: Wake Up Consistently
Your circadian rhythm thrives on consistency.

### Step 3: Hydrate and Move
Start with water and 10 minutes of movement.

### Step 4: Mindful Moments
- Meditation
- Journaling
- Gratitude practice

### Step 5: Fuel Your Body
Nutritious breakfast with protein and healthy fats.

The best routine is one you can maintain consistently.""",
            "author": "sarah_writer",
            "categories": ["Lifestyle", "Education"],
            "is_premium": False
        },
        {
            "title": "From Startup to Success: Building a $100M Company",
            "content": """# The Entrepreneurial Journey

After 8 years of building startups, here are hard-earned lessons.

## The Idea Myth
Execution beats innovation 9 times out of 10.

## Building the Right Team
- The Visionary: Sets direction
- The Builder: Creates product
- The Operator: Scales business

## Product-Market Fit
You know you have it when customers pull the product from you.

## Scaling Challenges
- 0-10 employees: Focus on product
- 10-50 employees: Build processes
- 50+ employees: Create culture

## Fundraising Reality
- Pre-seed: $100K-$500K
- Seed: $500K-$2M
- Series A: $2M-$15M

Building a startup is 1% inspiration and 99% perspiration.""",
            "author": "mike_biz",
            "categories": ["Business", "Education"],
            "is_premium": True,
            "premium_price": 9.99
        },
        {
            "title": "Color Psychology in Digital Design",
            "content": """# The Secret Weapon of Great Design

Colors influence behavior, emotions, and decision-making.

## How Colors Affect the Brain
- Red: Urgency and excitement
- Blue: Trust and professionalism
- Green: Growth and harmony
- Yellow: Creativity and optimism

## UI Design Impact
Color changes can increase conversions by 200%.

## Practical Framework
1. Define brand personality
2. Create color hierarchy
3. Test and iterate

## Tools
- Adobe Color
- Coolors.co
- Paletton

Great design makes things work better, not just look good.""",
            "author": "emma_design",
            "categories": ["Creative", "Technology"],
            "is_premium": False
        },
        {
            "title": "Machine Learning in Healthcare: Saving Lives",
            "content": """# AI-Powered Healthcare Revolution

Machine learning transforms healthcare from detection to treatment.

## Current Applications
- Medical imaging: 94.5% accuracy in cancer detection
- Drug discovery: 100x faster compound identification
- Personalized medicine based on genetic profiles

## Breakthrough Technologies
- Deep learning for image analysis
- Wearable device integration
- Predictive health monitoring

## Future Impact
By 2030, AI will save $150 billion in healthcare costs.""",
            "author": "david_sci",
            "categories": ["Science", "Technology"],
            "is_premium": True,
            "premium_price": 7.99
        },
        {
            "title": "Mastering French Cuisine: Essential Techniques",
            "content": """# The Art of French Cooking

Master these fundamentals to cook like a professional chef.

## The Five Mother Sauces
1. Bechamel: White sauce base
2. Veloute: Blonde sauce with stock
3. Espagnole: Brown sauce
4. Hollandaise: Butter sauce
5. Tomato: Classic tomato base

## Essential Knife Skills
- Julienne: Matchstick cuts
- Brunoise: Fine dice
- Chiffonade: Herb ribbons

## Flavor Building
Start with onions, carrots, and celery - the holy trinity.

## Professional Tips
Mise en place: Everything in its place before cooking.

Master these fundamentals for French chef confidence.""",
            "author": "lisa_food",
            "categories": ["Food", "Education"],
            "is_premium": False
        }
    ]
    
    posts = []
    for post_data in posts_data:
        created_date = timezone.now() - timedelta(days=random.randint(1, 30))
        
        post = Post.objects.create(
            title=post_data["title"],
            content=post_data["content"],
            author=users[post_data["author"]],
            created_at=created_date,
            is_premium=post_data.get("is_premium", False),
            premium_price=post_data.get("premium_price", 0)
        )
        
        # Add categories
        for category_name in post_data["categories"]:
            post.categories.add(categories[category_name])
        
        # Set first category for compatibility
        post.category = categories[post_data["categories"][0]]
        post.save()
        
        posts.append(post)
        print(f"Created post: {post.title[:40]}...")
    
    # Create engagement
    user_list = list(users.values())
    
    # Create follows
    for user in user_list:
        others = [u for u in user_list if u != user]
        follows = random.sample(others, min(3, len(others)))
        for followed in follows:
            Follow.objects.get_or_create(follower=user, following=followed)
    
    # Create likes and comments
    for post in posts:
        # Likes
        num_likes = random.randint(5, 25)
        likers = random.sample(user_list, min(num_likes, len(user_list)))
        for liker in likers:
            Like.objects.get_or_create(user=liker, post=post)
        
        # Comments
        comments = [
            "Great insights! Thanks for sharing.",
            "This is exactly what I needed.",
            "Fantastic article! Well researched.",
            "Very informative and helpful.",
            "Excellent work! Looking forward to more."
        ]
        
        num_comments = random.randint(2, 6)
        for _ in range(num_comments):
            Comment.objects.create(
                post=post,
                author=random.choice(user_list),
                content=random.choice(comments)
            )
        
        # Views
        num_views = random.randint(20, 150)
        for _ in range(num_views):
            PostView.objects.create(
                post=post,
                user=random.choice(user_list)
            )
    
    print("Demo data created successfully!")
    print(f"Users: {User.objects.filter(is_superuser=False).count()}")
    print(f"Categories: {Category.objects.count()}")
    print(f"Posts: {Post.objects.count()}")
    print(f"Comments: {Comment.objects.count()}")
    print(f"Likes: {Like.objects.count()}")
    print(f"Follows: {Follow.objects.count()}")
    print(f"Views: {PostView.objects.count()}")
    print("Password for all users: demo123")

if __name__ == "__main__":
    create_demo_data()
