from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Category, Post, Comment, Like, Follow, PostView
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create demo data for the application'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')
        
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
            self.stdout.write(f'Created category: {name}')
        
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
            self.stdout.write(f'Created user: {user_data["username"]}')
        
        # Create rich posts
        posts_data = [
            {
                "title": "The Future of AI: Transforming Industries in 2024",
                "content": """# The AI Revolution is Here

Artificial Intelligence is reshaping industries today. From healthcare to finance, AI drives innovation and efficiency.

## Key Trends in 2024

### Generative AI Goes Mainstream
Large Language Models like GPT-4 revolutionize content creation, code generation, and problem-solving across industries.

### AI in Healthcare
Machine learning algorithms are now capable of:
- Diagnosing diseases with 95% accuracy
- Predicting patient outcomes
- Accelerating drug discovery processes

### Autonomous Systems
Self-driving cars, drones, and robotics are becoming more sophisticated and reliable.

## The Impact on Business

Companies leveraging AI are seeing:
- 40% increase in productivity
- 25% reduction in operational costs
- Enhanced customer experiences

## What's Next?

The next wave of AI will focus on:
- Ethical AI development
- Human-AI collaboration
- Democratizing AI tools for small businesses

The future belongs to those who embrace AI today.""",
                "author": "alex_tech",
                "categories": ["Technology", "Business"],
                "is_premium": True,
                "premium_price": 4.99
            },
            {
                "title": "Building a Sustainable Morning Routine: Complete Guide",
                "content": """# Transform Your Mornings, Transform Your Life

A well-crafted morning routine is the foundation of a productive and fulfilling day.

## The Science Behind Morning Routines

Research shows that people with consistent morning routines are:
- 23% more productive throughout the day
- Less likely to experience decision fatigue
- More likely to achieve their long-term goals

## The 5-Step Framework

### Step 1: Prepare the Night Before
Set yourself up for success by:
- Laying out clothes
- Preparing breakfast ingredients
- Setting a consistent bedtime

### Step 2: Wake Up at the Same Time Daily
Your circadian rhythm thrives on consistency. Even weekends should vary by no more than 1 hour.

### Step 3: Hydrate and Move
Start with a large glass of water and 10 minutes of light movement.

### Step 4: Mindful Moments
Incorporate 5-10 minutes of meditation, journaling, or gratitude practice.

### Step 5: Fuel Your Body
A nutritious breakfast with protein, healthy fats, and complex carbs.

Remember: The best routine is the one you can maintain consistently.""",
                "author": "sarah_writer",
                "categories": ["Lifestyle", "Education"],
                "is_premium": False
            },
            {
                "title": "From Startup to Success: Building a $100M Company",
                "content": """# The Entrepreneurial Journey: Real Lessons from the Trenches

After 8 years of building startups, including one that reached a $100M valuation, here are the hard-earned lessons.

## Chapter 1: The Idea Myth

**Myth**: You need a revolutionary idea to succeed.
**Reality**: Execution beats innovation 9 times out of 10.

## Chapter 2: Building the Right Team

### The 3 Essential Co-founder Types
1. **The Visionary**: Sets direction and inspires
2. **The Builder**: Creates the product
3. **The Operator**: Scales the business

## Chapter 3: Product-Market Fit

You know you've achieved product-market fit when:
- Customers are pulling the product from you
- Word-of-mouth growth accelerates
- You struggle to keep up with demand

## Chapter 4: Scaling Challenges

### The 3 Scaling Phases
1. **0-10 employees**: Focus on product
2. **10-50 employees**: Build processes
3. **50+ employees**: Create culture

## Chapter 5: Fundraising Reality

- **Pre-seed**: $100K-$500K (friends, family, angels)
- **Seed**: $500K-$2M (seed funds, strategic angels)
- **Series A**: $2M-$15M (VCs, growth metrics required)

Building a startup is 1% inspiration and 99% perspiration.""",
                "author": "mike_biz",
                "categories": ["Business", "Education"],
                "is_premium": True,
                "premium_price": 9.99
            },
            {
                "title": "The Psychology of Color in Digital Design",
                "content": """# Color Psychology: The Secret Weapon of Great Design

Colors aren't just aesthetic choices—they're powerful psychological tools that influence behavior and emotions.

## How Colors Affect the Brain
- **Red**: Increases urgency, appetite, and excitement
- **Blue**: Builds trust, calm, and professionalism
- **Green**: Represents growth, nature, and harmony
- **Yellow**: Stimulates creativity and optimism

## Color in User Interface Design

### Conversion Rate Impact
Studies show that color changes can increase conversions by up to 200%:
- Red call-to-action buttons: +21% clicks
- Green signup buttons: +13% conversions
- Blue trust badges: +15% form completions

## Practical Application Framework

### Step 1: Define Your Brand Personality
- Trustworthy → Blue palette
- Energetic → Red/orange palette
- Natural → Green/brown palette
- Luxurious → Purple/black palette

### Step 2: Create a Color Hierarchy
- **Primary**: Main brand color (60% of design)
- **Secondary**: Complementary color (30% of design)
- **Accent**: Action color (10% of design)

### Step 3: Test and Iterate
A/B test different color combinations to optimize for click-through rates and conversions.

Remember: Great design isn't just about making things look good—it's about making them work better.""",
                "author": "emma_design",
                "categories": ["Creative", "Technology"],
                "is_premium": False
            },
            {
                "title": "Machine Learning in Healthcare: Saving Lives with Data",
                "content": """# AI-Powered Healthcare: The Medical Revolution

Machine learning is transforming healthcare, from early disease detection to personalized treatment plans.

## Current Applications

### 1. Medical Imaging
AI systems now outperform human radiologists in:
- Detecting breast cancer in mammograms (94.5% accuracy)
- Identifying diabetic retinopathy (98% sensitivity)
- Analyzing CT scans for COVID-19 (95% accuracy)

### 2. Drug Discovery
Machine learning accelerates pharmaceutical research:
- Reduces drug discovery time from 10-15 years to 3-5 years
- Identifies potential drug compounds 100x faster
- Predicts drug interactions and side effects

### 3. Personalized Medicine
AI enables treatment customization based on:
- Genetic profiles
- Medical history
- Lifestyle factors
- Real-time biomarkers

## Future Directions

### Predictive Healthcare
AI will predict health issues before symptoms appear:
- Heart attacks 5 years in advance
- Alzheimer's disease 10 years early
- Cancer risk assessment

## The Impact

By 2030, AI in healthcare is expected to:
- Save $150 billion annually in US healthcare costs
- Improve diagnostic accuracy by 40%
- Reduce medical errors by 50%

The future of healthcare is data-driven, and the possibilities are limitless.""",
                "author": "david_sci",
                "categories": ["Science", "Technology"],
                "is_premium": True,
                "premium_price": 7.99
            },
            {
                "title": "Mastering French Cuisine: Essential Techniques",
                "content": """# The Art of French Cooking: Mastering the Fundamentals

French cuisine is the foundation of culinary arts worldwide. Master these essential techniques.

## The Five Mother Sauces

Every French sauce derives from these five foundations:

### 1. Bechamel (White Sauce)
**Base**: Butter, flour, milk
**Uses**: Lasagna, gratins, souffles
**Key Tip**: Whisk constantly to prevent lumps

### 2. Veloute (Blonde Sauce)
**Base**: Butter, flour, light stock
**Uses**: Chicken, fish, vegetable dishes
**Key Tip**: Use warm stock for smooth consistency

### 3. Espagnole (Brown Sauce)
**Base**: Brown roux, brown stock, tomatoes
**Uses**: Red meat, game dishes

### 4. Hollandaise (Butter Sauce)
**Base**: Egg yolks, butter, lemon juice
**Uses**: Eggs Benedict, asparagus, fish

### 5. Tomato Sauce
**Base**: Tomatoes, vegetables, herbs
**Uses**: Pasta, meat, vegetables

## Essential Knife Skills

### The French Knife Cuts
- **Julienne**: 2mm × 2mm × 5cm matchsticks
- **Brunoise**: 2mm × 2mm × 2mm dice
- **Chiffonade**: Thin ribbon cuts for herbs
- **Mirepoix**: Rough dice for flavor base

## Professional Tips

### Mise en Place
"Everything in its place" - prepare all ingredients before cooking:
- Measure all ingredients
- Prep vegetables and proteins
- Have tools ready
- Clean as you go

Master these fundamentals, and you'll cook with the confidence of a French chef.""",
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
            
            # Add multiple categories
            for category_name in post_data["categories"]:
                post.categories.add(categories[category_name])
            
            # Set first category for compatibility
            post.category = categories[post_data["categories"][0]]
            post.save()
            
            posts.append(post)
            self.stdout.write(f'Created post: {post.title[:40]}...')
        
        # Create engagement data
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
                "This is exactly what I needed to read today.",
                "Fantastic article! Very well researched.",
                "I learned so much from this post.",
                "Brilliant work! Looking forward to more.",
                "Very informative and well-written.",
                "Thanks for the detailed explanation!"
            ]
            
            num_comments = random.randint(2, 6)
            for _ in range(num_comments):
                Comment.objects.create(
                    post=post,
                    author=random.choice(user_list),
                    content=random.choice(comments),
                    created_at=post.created_at + timedelta(hours=random.randint(1, 72))
                )
            
            # Views
            num_views = random.randint(20, 150)
            for _ in range(num_views):
                PostView.objects.create(
                    post=post,
                    user=random.choice(user_list),
                    viewed_at=post.created_at + timedelta(hours=random.randint(1, 168))
                )
        
        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
        self.stdout.write(f'Users: {User.objects.filter(is_superuser=False).count()}')
        self.stdout.write(f'Categories: {Category.objects.count()}')
        self.stdout.write(f'Posts: {Post.objects.count()}')
        self.stdout.write(f'Comments: {Comment.objects.count()}')
        self.stdout.write(f'Likes: {Like.objects.count()}')
        self.stdout.write(f'Follows: {Follow.objects.count()}')
        self.stdout.write(f'Views: {PostView.objects.count()}')
        self.stdout.write(self.style.SUCCESS('Password for all demo users: demo123'))
