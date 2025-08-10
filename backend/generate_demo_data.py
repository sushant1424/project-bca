#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from posts.models import Category, Post, Comment, Like, Follow, PostView
from django.utils import timezone
from django.utils.text import slugify

User = get_user_model()

def create_demo_data():
    print("🚀 Starting demo data generation...")
    
    # Clear existing data
    print("🧹 Clearing existing data...")
    PostView.objects.all().delete()
    Like.objects.all().delete()
    Comment.objects.all().delete()
    Follow.objects.all().delete()
    Post.objects.all().delete()
    Category.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    
    # Create categories
    print("📂 Creating categories...")
    categories_data = [
        {"name": "Technology", "description": "Latest tech trends, programming, AI, and digital innovation"},
        {"name": "Lifestyle", "description": "Health, wellness, travel, and personal development"},
        {"name": "Business", "description": "Entrepreneurship, finance, marketing, and career advice"},
        {"name": "Creative", "description": "Art, design, photography, and creative expression"},
        {"name": "Science", "description": "Research, discoveries, and scientific breakthroughs"},
        {"name": "Education", "description": "Learning resources, tutorials, and academic insights"},
        {"name": "Entertainment", "description": "Movies, music, gaming, and pop culture"},
        {"name": "Food", "description": "Recipes, restaurants, and culinary experiences"}
    ]
    
    categories = {}
    for cat_data in categories_data:
        category = Category.objects.create(
            name=cat_data["name"],
            slug=slugify(cat_data["name"]),
            description=cat_data["description"]
        )
        categories[cat_data["name"]] = category
        print(f"✅ Created category: {cat_data['name']}")
    
    # Create demo users
    print("👥 Creating demo users...")
    users_data = [
        {
            "username": "alex_tech",
            "email": "alex@example.com",
            "first_name": "Alex",
            "last_name": "Johnson",
            "bio": "Full-stack developer passionate about AI and machine learning. Building the future one line of code at a time."
        },
        {
            "username": "sarah_writer",
            "email": "sarah@example.com",
            "first_name": "Sarah",
            "last_name": "Chen",
            "bio": "Content creator and digital marketer. Helping brands tell their stories through compelling content."
        },
        {
            "username": "mike_entrepreneur",
            "email": "mike@example.com",
            "first_name": "Mike",
            "last_name": "Rodriguez",
            "bio": "Serial entrepreneur and startup advisor. Turning ideas into successful businesses since 2015."
        },
        {
            "username": "emma_designer",
            "email": "emma@example.com",
            "first_name": "Emma",
            "last_name": "Thompson",
            "bio": "UX/UI designer with a passion for creating beautiful and functional digital experiences."
        },
        {
            "username": "david_scientist",
            "email": "david@example.com",
            "first_name": "David",
            "last_name": "Kim",
            "bio": "Data scientist and researcher exploring the intersection of AI and healthcare."
        },
        {
            "username": "lisa_chef",
            "email": "lisa@example.com",
            "first_name": "Lisa",
            "last_name": "Martinez",
            "bio": "Professional chef and food blogger sharing culinary adventures from around the world."
        }
    ]
    
    users = {}
    for user_data in users_data:
        user = User.objects.create_user(
            username=user_data["username"],
            email=user_data["email"],
            password="demo123",
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            bio=user_data["bio"]
        )
        users[user_data["username"]] = user
        print(f"✅ Created user: {user_data['username']}")
    
    # Create rich posts with multiple categories
    print("📝 Creating rich demo posts...")
    posts_data = [
        {
            "title": "The Future of Artificial Intelligence: Transforming Industries in 2024",
            "content": """# The AI Revolution is Here

Artificial Intelligence is no longer a futuristic concept—it's reshaping industries today. From healthcare to finance, AI is driving unprecedented innovation and efficiency.

## Key Trends Shaping AI in 2024

### 1. Generative AI Goes Mainstream
Large Language Models like GPT-4 and Claude are revolutionizing content creation, code generation, and problem-solving across industries.

### 2. AI in Healthcare
Machine learning algorithms are now capable of:
- Diagnosing diseases with 95% accuracy
- Predicting patient outcomes
- Accelerating drug discovery processes

### 3. Autonomous Systems
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

*The future belongs to those who embrace AI today.*""",
            "author": "alex_tech",
            "categories": ["Technology", "Business", "Science"],
            "is_premium": True,
            "premium_price": 4.99,
            "premium_preview": "Discover the latest AI trends that are transforming industries in 2024. From generative AI to healthcare applications..."
        },
        {
            "title": "Building a Sustainable Morning Routine: A Complete Guide",
            "content": """# Transform Your Mornings, Transform Your Life

A well-crafted morning routine is the foundation of a productive and fulfilling day. Here's how to build one that actually sticks.

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
Start with a large glass of water and 10 minutes of light movement—stretching, yoga, or a short walk.

### Step 4: Mindful Moments
Incorporate 5-10 minutes of:
- Meditation
- Journaling
- Gratitude practice

### Step 5: Fuel Your Body
A nutritious breakfast with protein, healthy fats, and complex carbs sets the tone for stable energy.

## Common Mistakes to Avoid

- Starting too ambitiously
- Checking phone immediately upon waking
- Skipping breakfast
- Inconsistent timing

## Sample 30-Minute Routine

- 5 min: Hydrate and light stretching
- 10 min: Meditation or journaling
- 15 min: Healthy breakfast

Remember: The best routine is the one you can maintain consistently.""",
            "author": "sarah_writer",
            "categories": ["Lifestyle", "Education"],
            "is_premium": False
        },
        {
            "title": "From Idea to IPO: Lessons from Building a $100M Startup",
            "content": """# The Entrepreneurial Journey: Real Lessons from the Trenches

After 8 years of building startups, including one that reached a $100M valuation, here are the hard-earned lessons I wish I knew at the beginning.

## Chapter 1: The Idea Myth

**Myth**: You need a revolutionary idea to succeed.
**Reality**: Execution beats innovation 9 times out of 10.

The most successful startups often take existing ideas and execute them better:
- Uber wasn't the first ride-sharing app
- Facebook wasn't the first social network
- Google wasn't the first search engine

## Chapter 2: Building the Right Team

### The 3 Essential Co-founder Types
1. **The Visionary**: Sets direction and inspires
2. **The Builder**: Creates the product
3. **The Operator**: Scales the business

### Red Flags When Hiring
- Lack of curiosity during interviews
- Overemphasis on compensation
- Inability to admit mistakes

## Chapter 3: Product-Market Fit

You know you've achieved product-market fit when:
- Customers are pulling the product from you
- Word-of-mouth growth accelerates
- You struggle to keep up with demand

### Metrics That Matter
- Net Promoter Score (NPS) > 50
- Monthly retention rate > 80%
- Organic growth rate > 20%

## Chapter 4: Scaling Challenges

### The 3 Scaling Phases
1. **0-10 employees**: Focus on product
2. **10-50 employees**: Build processes
3. **50+ employees**: Create culture

## Chapter 5: Fundraising Reality

**Pre-seed**: $100K-$500K (friends, family, angels)
**Seed**: $500K-$2M (seed funds, strategic angels)
**Series A**: $2M-$15M (VCs, growth metrics required)

### What Investors Really Want
- Proven traction
- Large addressable market
- Exceptional team
- Clear path to profitability

## The Bottom Line

Building a startup is 1% inspiration and 99% perspiration. Focus on solving real problems for real people, and the rest will follow.""",
            "author": "mike_entrepreneur",
            "categories": ["Business", "Education"],
            "is_premium": True,
            "premium_price": 9.99,
            "premium_preview": "Discover the real lessons from building a $100M startup. From product-market fit to scaling challenges..."
        },
        {
            "title": "The Psychology of Color in Digital Design",
            "content": """# Color Psychology: The Secret Weapon of Great Design

Colors aren't just aesthetic choices—they're powerful psychological tools that influence behavior, emotions, and decision-making.

## The Science of Color Psychology

### How Colors Affect the Brain
- **Red**: Increases urgency, appetite, and excitement
- **Blue**: Builds trust, calm, and professionalism
- **Green**: Represents growth, nature, and harmony
- **Yellow**: Stimulates creativity and optimism
- **Purple**: Conveys luxury and creativity
- **Orange**: Energizes and encourages action
- **Black**: Suggests sophistication and elegance

## Color in User Interface Design

### Conversion Rate Impact
Studies show that color changes can increase conversions by up to 200%:
- Red call-to-action buttons: +21% clicks
- Green signup buttons: +13% conversions
- Blue trust badges: +15% form completions

### Cultural Considerations
Color meanings vary across cultures:
- **White**: Purity in Western cultures, mourning in Eastern cultures
- **Red**: Luck in China, danger in Western countries
- **Green**: Nature globally, but inexperience in some contexts

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
A/B test different color combinations to optimize for:
- Click-through rates
- Conversion rates
- User engagement
- Brand recall

## Tools for Color Selection

### Professional Tools
- Adobe Color
- Coolors.co
- Paletton
- Color Hunt

### Accessibility Considerations
Ensure your color choices meet WCAG guidelines:
- Contrast ratio of at least 4.5:1
- Don't rely solely on color to convey information
- Test with colorblind users

## Case Studies

### Netflix: Red for Urgency
Netflix's red branding creates a sense of urgency and excitement, perfect for entertainment.

### Spotify: Green for Growth
Spotify's green represents the growth of music discovery and personal playlists.

### LinkedIn: Blue for Trust
LinkedIn's blue builds professional trust and reliability.

Remember: Great design isn't just about making things look good—it's about making them work better.""",
            "author": "emma_designer",
            "categories": ["Creative", "Technology", "Business"],
            "is_premium": False
        },
        {
            "title": "Machine Learning in Healthcare: Saving Lives with Data",
            "content": """# AI-Powered Healthcare: The Medical Revolution

Machine learning is transforming healthcare, from early disease detection to personalized treatment plans. Here's how data science is saving lives.

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

## Breakthrough Technologies

### Deep Learning Models
- **Convolutional Neural Networks**: Image analysis
- **Recurrent Neural Networks**: Time-series health data
- **Transformer Models**: Medical text analysis

### Wearable Integration
Smart devices collect continuous health data:
- Heart rate variability
- Sleep patterns
- Activity levels
- Blood oxygen saturation

## Challenges and Solutions

### Data Privacy
**Challenge**: Protecting sensitive medical information
**Solution**: Federated learning and differential privacy

### Algorithm Bias
**Challenge**: Ensuring AI works for all demographics
**Solution**: Diverse training data and bias detection tools

### Regulatory Approval
**Challenge**: Meeting FDA requirements for medical AI
**Solution**: Explainable AI and rigorous clinical trials

## Future Directions

### Predictive Healthcare
AI will predict health issues before symptoms appear:
- Heart attacks 5 years in advance
- Alzheimer's disease 10 years early
- Cancer risk assessment

### Virtual Health Assistants
AI-powered chatbots will provide:
- 24/7 health monitoring
- Medication reminders
- Symptom assessment
- Mental health support

### Robotic Surgery
AI-assisted surgical robots offer:
- Millimeter precision
- Reduced recovery times
- Lower complication rates

## The Impact

By 2030, AI in healthcare is expected to:
- Save $150 billion annually in US healthcare costs
- Improve diagnostic accuracy by 40%
- Reduce medical errors by 50%
- Enable personalized treatment for 80% of patients

The future of healthcare is data-driven, and the possibilities are limitless.""",
            "author": "david_scientist",
            "categories": ["Science", "Technology", "Education"],
            "is_premium": True,
            "premium_price": 7.99,
            "premium_preview": "Explore how machine learning is revolutionizing healthcare, from early disease detection to personalized medicine..."
        },
        {
            "title": "Mastering French Cuisine: Essential Techniques Every Cook Should Know",
            "content": """# The Art of French Cooking: Mastering the Fundamentals

French cuisine is the foundation of culinary arts worldwide. Master these essential techniques to elevate your cooking to professional levels.

## The Five Mother Sauces

Every French sauce derives from these five foundations:

### 1. Béchamel (White Sauce)
**Base**: Butter, flour, milk
**Uses**: Lasagna, gratins, soufflés
**Key Tip**: Whisk constantly to prevent lumps

### 2. Velouté (Blonde Sauce)
**Base**: Butter, flour, light stock
**Uses**: Chicken, fish, vegetable dishes
**Key Tip**: Use warm stock for smooth consistency

### 3. Espagnole (Brown Sauce)
**Base**: Brown roux, brown stock, tomatoes
**Uses**: Red meat, game dishes
**Key Tip**: Roast bones for deeper flavor

### 4. Hollandaise (Butter Sauce)
**Base**: Egg yolks, butter, lemon juice
**Uses**: Eggs Benedict, asparagus, fish
**Key Tip**: Control temperature to prevent breaking

### 5. Tomato Sauce
**Base**: Tomatoes, vegetables, herbs
**Uses**: Pasta, meat, vegetables
**Key Tip**: Cook slowly to concentrate flavors

## Essential Knife Skills

### The French Knife Cuts
- **Julienne**: 2mm × 2mm × 5cm matchsticks
- **Brunoise**: 2mm × 2mm × 2mm dice
- **Chiffonade**: Thin ribbon cuts for herbs
- **Mirepoix**: Rough dice for flavor base

### Knife Maintenance
- Hone before each use
- Sharpen monthly
- Hand wash and dry immediately
- Store in knife block or magnetic strip

## Classic Cooking Methods

### 1. Sautéing
**Technique**: High heat, small amount of fat
**Best For**: Vegetables, thin cuts of meat
**Key**: Keep food moving in the pan

### 2. Braising
**Technique**: Sear, then slow cook in liquid
**Best For**: Tough cuts of meat
**Key**: Low, consistent temperature

### 3. Poaching
**Technique**: Gentle cooking in flavored liquid
**Best For**: Fish, eggs, fruit
**Key**: Never let liquid boil

## Flavor Building Techniques

### The Holy Trinity
French cooking starts with:
- **Onions**: Sweetness and depth
- **Carrots**: Natural sugars and color
- **Celery**: Aromatic foundation

### Herb Combinations
- **Bouquet Garni**: Thyme, bay leaf, parsley
- **Fines Herbes**: Chives, parsley, tarragon, chervil
- **Herbes de Provence**: Lavender, rosemary, thyme, oregano

## Professional Tips

### Mise en Place
"Everything in its place" - prepare all ingredients before cooking:
- Measure all ingredients
- Prep vegetables and proteins
- Have tools ready
- Clean as you go

### Temperature Control
- Use a thermometer for precision
- Let meat rest after cooking
- Taste and adjust seasoning constantly

### Plating Like a Pro
- Warm plates before serving
- Use odd numbers for visual appeal
- Height adds drama
- Sauce around, not over

## Building Your French Pantry

### Essential Ingredients
- High-quality butter
- Fresh herbs
- Good wine for cooking
- Quality vinegars
- Sea salt and white pepper

### Equipment Basics
- Heavy-bottomed pans
- Sharp knives
- Wooden spoons
- Fine-mesh strainer
- Digital scale

Master these fundamentals, and you'll cook with the confidence and skill of a French chef. *Bon appétit!*""",
            "author": "lisa_chef",
            "categories": ["Food", "Education"],
            "is_premium": False
        }
    ]
    
    posts = []
    for i, post_data in enumerate(posts_data):
        # Create post with random date in the last 30 days
        created_date = timezone.now() - timedelta(days=random.randint(1, 30))
        
        post = Post.objects.create(
            title=post_data["title"],
            content=post_data["content"],
            author=users[post_data["author"]],
            created_at=created_date,
            updated_at=created_date,
            is_premium=post_data.get("is_premium", False),
            premium_price=post_data.get("premium_price", 0),
            premium_preview=post_data.get("premium_preview", "")
        )
        
        # Add multiple categories
        for category_name in post_data["categories"]:
            post.categories.add(categories[category_name])
        
        # Set first category as the old single category field for compatibility
        post.category = categories[post_data["categories"][0]]
        post.save()
        
        posts.append(post)
        print(f"✅ Created post: {post.title[:50]}...")
    
    # Create engagement data
    print("💬 Creating engagement data...")
    
    # Create follows
    user_list = list(users.values())
    for user in user_list:
        # Each user follows 2-4 other users
        num_follows = random.randint(2, 4)
        other_users = [u for u in user_list if u != user]
        follows = random.sample(other_users, min(num_follows, len(other_users)))
        
        for followed_user in follows:
            Follow.objects.get_or_create(follower=user, following=followed_user)
    
    # Create likes and comments
    for post in posts:
        # Random number of likes (0-20)
        num_likes = random.randint(0, 20)
        likers = random.sample(user_list, min(num_likes, len(user_list)))
        
        for liker in likers:
            Like.objects.get_or_create(user=liker, post=post)
        
        # Random number of comments (0-8)
        num_comments = random.randint(0, 8)
        comment_texts = [
            "Great insights! Thanks for sharing.",
            "This is exactly what I needed to read today.",
            "Fantastic article! Very well researched.",
            "I learned so much from this post.",
            "Brilliant work! Looking forward to more.",
            "This changed my perspective completely.",
            "Excellent points throughout the article.",
            "Very informative and well-written.",
            "Thanks for the detailed explanation!",
            "This is incredibly helpful."
        ]
        
        for _ in range(num_comments):
            commenter = random.choice(user_list)
            comment_text = random.choice(comment_texts)
            Comment.objects.create(
                post=post,
                author=commenter,
                content=comment_text,
                created_at=post.created_at + timedelta(hours=random.randint(1, 72))
            )
    
    # Create post views
    print("👀 Creating post views...")
    for post in posts:
        # Random number of views (10-100)
        num_views = random.randint(10, 100)
        for _ in range(num_views):
            viewer = random.choice(user_list)
            # Create view with random timestamp after post creation
            view_time = post.created_at + timedelta(hours=random.randint(1, 24*7))
            PostView.objects.create(
                post=post,
                user=viewer,
                viewed_at=view_time
            )
    
    print("✨ Demo data generation completed!")
    print(f"📊 Summary:")
    print(f"   - Users: {User.objects.filter(is_superuser=False).count()}")
    print(f"   - Categories: {Category.objects.count()}")
    print(f"   - Posts: {Post.objects.count()}")
    print(f"   - Comments: {Comment.objects.count()}")
    print(f"   - Likes: {Like.objects.count()}")
    print(f"   - Follows: {Follow.objects.count()}")
    print(f"   - Post Views: {PostView.objects.count()}")
    print(f"\n🔐 All demo users have password: demo123")
    print(f"🎯 Premium posts are marked and ready for testing!")

if __name__ == "__main__":
    create_demo_data()
