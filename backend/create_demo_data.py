#!/usr/bin/env python
"""
Enhanced Demo Data Generator for Wrytera
Creates realistic users and rich, long-form posts with premium content
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
import random
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from posts.models import Post, Category, Comment, Follow, PostView
from django.contrib.auth.hashers import make_password

User = get_user_model()

# Enhanced demo users with diverse backgrounds
DEMO_USERS = [
    {'username': 'alex_tech', 'email': 'alex@demo.com', 'first_name': 'Alex', 'last_name': 'Johnson', 'bio': 'Full-stack developer passionate about AI and web technologies'},
    {'username': 'sarah_wellness', 'email': 'sarah@demo.com', 'first_name': 'Sarah', 'last_name': 'Chen', 'bio': 'Certified nutritionist and mindfulness coach'},
    {'username': 'mike_travel', 'email': 'mike@demo.com', 'first_name': 'Mike', 'last_name': 'Davis', 'bio': 'Travel photographer and sustainable tourism advocate'},
    {'username': 'emma_chef', 'email': 'emma@demo.com', 'first_name': 'Emma', 'last_name': 'Wilson', 'bio': 'Professional chef specializing in plant-based cuisine'},
    {'username': 'david_finance', 'email': 'david@demo.com', 'first_name': 'David', 'last_name': 'Brown', 'bio': 'Financial advisor and cryptocurrency enthusiast'},
    {'username': 'lisa_artist', 'email': 'lisa@demo.com', 'first_name': 'Lisa', 'last_name': 'Garcia', 'bio': 'Digital artist and creative director'},
    {'username': 'tom_fitness', 'email': 'tom@demo.com', 'first_name': 'Tom', 'last_name': 'Miller', 'bio': 'Personal trainer and sports nutrition expert'},
    {'username': 'anna_writer', 'email': 'anna@demo.com', 'first_name': 'Anna', 'last_name': 'Taylor', 'bio': 'Freelance writer and content strategist'},
    {'username': 'john_business', 'email': 'john@demo.com', 'first_name': 'John', 'last_name': 'Anderson', 'bio': 'Startup founder and business mentor'},
    {'username': 'kate_educator', 'email': 'kate@demo.com', 'first_name': 'Kate', 'last_name': 'Thomas', 'bio': 'Online educator and course creator'},
    {'username': 'ryan_designer', 'email': 'ryan@demo.com', 'first_name': 'Ryan', 'last_name': 'Jackson', 'bio': 'UX/UI designer and design systems specialist'},
    {'username': 'zoe_scientist', 'email': 'zoe@demo.com', 'first_name': 'Zoe', 'last_name': 'White', 'bio': 'Environmental scientist and climate researcher'},
    {'username': 'ben_musician', 'email': 'ben@demo.com', 'first_name': 'Ben', 'last_name': 'Harris', 'bio': 'Music producer and sound engineer'},
    {'username': 'maya_psychologist', 'email': 'maya@demo.com', 'first_name': 'Maya', 'last_name': 'Clark', 'bio': 'Clinical psychologist and mental health advocate'},
    {'username': 'luke_entrepreneur', 'email': 'luke@demo.com', 'first_name': 'Luke', 'last_name': 'Lewis', 'bio': 'Serial entrepreneur and innovation consultant'},
]

# Categories to create
CATEGORIES = [
    {'name': 'Technology', 'description': 'Latest in tech, programming, AI, and digital innovation', 'color': '#3B82F6'},
    {'name': 'Health & Wellness', 'description': 'Physical and mental health, nutrition, and lifestyle', 'color': '#10B981'},
    {'name': 'Travel & Adventure', 'description': 'Travel guides, experiences, and cultural exploration', 'color': '#F59E0B'},
    {'name': 'Food & Cooking', 'description': 'Recipes, culinary techniques, and food culture', 'color': '#EF4444'},
    {'name': 'Business & Finance', 'description': 'Entrepreneurship, investing, and financial advice', 'color': '#8B5CF6'},
    {'name': 'Art & Design', 'description': 'Creative arts, design principles, and visual culture', 'color': '#EC4899'},
    {'name': 'Education & Learning', 'description': 'Teaching methods, online learning, and skill development', 'color': '#06B6D4'},
    {'name': 'Science & Environment', 'description': 'Scientific discoveries and environmental issues', 'color': '#84CC16'},
    {'name': 'Music & Entertainment', 'description': 'Music production, entertainment industry insights', 'color': '#F97316'},
    {'name': 'Personal Development', 'description': 'Self-improvement, productivity, and life skills', 'color': '#6366F1'},
]

# Comprehensive post content with rich, long-form articles
POST_CONTENT = {
    'Technology': [
        {
            'title': 'The Complete Guide to Building AI-Powered Web Applications in 2024',
            'excerpt': 'A comprehensive deep-dive into integrating artificial intelligence into modern web development workflows, featuring practical examples and cutting-edge tools.',
            'content': '''# The Complete Guide to Building AI-Powered Web Applications in 2024

## Introduction: The AI Revolution in Web Development

Artificial Intelligence is no longer a futuristic concept—it's actively reshaping how we build, deploy, and maintain web applications. From automated code generation to intelligent user interfaces, AI tools are becoming essential components of the modern developer's toolkit.

In this comprehensive guide, we'll explore the practical applications of AI in web development, examine the tools that are changing the industry, and provide hands-on examples you can implement today.

## Chapter 1: AI-Powered Development Tools

### GitHub Copilot: Your AI Pair Programmer

GitHub Copilot has revolutionized the coding experience by providing intelligent code suggestions directly in your IDE. Unlike traditional autocomplete, Copilot understands context and can generate entire functions from simple comments.

**Key Features:**
- Context-aware code generation
- Multi-language support (JavaScript, Python, TypeScript, Go, and more)
- Integration with popular IDEs (VS Code, JetBrains, Neovim)
- Learning from your coding patterns

**Practical Example:**
```javascript
// Generate a function to validate email addresses
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

### ChatGPT and Code Generation

ChatGPT has become an invaluable tool for problem-solving, debugging, and learning new technologies. Its ability to explain complex concepts and generate working code makes it perfect for both beginners and experienced developers.

## Chapter 2: Machine Learning Integration

### Client-Side ML with TensorFlow.js

Modern web applications can now run machine learning models directly in the browser, enabling features like:

- Real-time image classification
- Natural language processing
- Predictive text and autocomplete
- Personalized user experiences

**Implementation Example:**
```javascript
import * as tf from '@tensorflow/tfjs';

// Load a pre-trained model
const model = await tf.loadLayersModel('/models/image-classifier.json');

// Make predictions
const prediction = model.predict(imageData);
```

### Server-Side AI with Python Integration

For more complex AI operations, server-side integration with Python frameworks like FastAPI provides powerful capabilities:

```python
from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()
classifier = pipeline("sentiment-analysis")

@app.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    result = classifier(text)
    return {"sentiment": result[0]["label"], "confidence": result[0]["score"]}
```

## Chapter 3: AI-Enhanced User Interfaces

### Intelligent Form Validation

AI can provide real-time, context-aware form validation that goes beyond simple regex patterns:

- Semantic validation of addresses using geocoding APIs
- Content moderation for user-generated content
- Smart autocomplete based on user behavior
- Dynamic form adaptation based on user input

### Personalized Content Delivery

Machine learning algorithms can analyze user behavior to deliver personalized experiences:

- Recommendation systems for content
- Dynamic pricing based on user segments
- A/B testing optimization
- Predictive user journey mapping

## Chapter 4: Performance Optimization with AI

### Automated Performance Monitoring

AI-powered tools can continuously monitor your application's performance and suggest optimizations:

- Lighthouse CI with automated suggestions
- Bundle analysis and optimization
- Database query optimization
- CDN configuration recommendations

### Predictive Scaling

Cloud platforms now offer AI-driven auto-scaling that predicts traffic patterns and scales resources proactively rather than reactively.

## Chapter 5: Security and AI

### Automated Vulnerability Detection

AI tools can scan your codebase for security vulnerabilities:

- Static code analysis with AI-powered insights
- Dependency vulnerability scanning
- Runtime security monitoring
- Automated penetration testing

### Fraud Detection

Implement real-time fraud detection in your applications:

```javascript
// Example fraud detection API integration
const fraudScore = await fetch('/api/fraud-check', {
    method: 'POST',
    body: JSON.stringify({
        userId: user.id,
        transactionAmount: amount,
        deviceFingerprint: getDeviceFingerprint(),
        behaviorMetrics: getUserBehaviorMetrics()
    })
});
```

## Chapter 6: The Future of AI in Web Development

### Emerging Trends

- **No-Code/Low-Code AI**: Tools that allow non-developers to build AI-powered applications
- **Edge AI**: Running AI models on edge devices for faster response times
- **Federated Learning**: Training AI models across distributed devices while preserving privacy
- **AI-Generated UI**: Tools that can generate entire user interfaces from descriptions

### Preparing for the Future

As AI continues to evolve, developers should focus on:

1. **Understanding AI fundamentals**: Basic knowledge of machine learning concepts
2. **Staying updated with tools**: Regularly exploring new AI-powered development tools
3. **Ethics and responsibility**: Understanding the implications of AI in applications
4. **Continuous learning**: AI is rapidly evolving, requiring ongoing education

## Conclusion

The integration of AI in web development is not just a trend—it's the future. Developers who embrace these tools today will be the leaders of tomorrow's tech landscape. Start small, experiment with different tools, and gradually build your AI expertise.

The key is to view AI as a powerful assistant that enhances your capabilities rather than replaces your creativity and problem-solving skills. The future belongs to developers who can effectively collaborate with AI to build better, smarter, and more efficient web applications.

---

*This guide will be regularly updated as new AI tools and techniques emerge. Follow me for the latest insights in AI-powered web development.*''',
            'is_premium': True,
            'premium_price': Decimal('9.99'),
            'premium_preview': 'Learn how to integrate cutting-edge AI tools into your web development workflow. This comprehensive guide covers GitHub Copilot, machine learning integration, and practical examples you can implement today.'
        },

The integration of AI in web development isn't just about writing code faster. It's about creating more intelligent applications that can adapt to user behavior, provide personalized experiences, and even predict user needs before they arise.

Machine learning algorithms are now being embedded directly into web applications, enabling features like real-time language translation, image recognition, and predictive analytics. This shift is creating new opportunities for developers who understand both traditional web technologies and AI concepts.

Looking ahead, we can expect to see even more sophisticated AI integration, including automated testing, performance optimization, and security vulnerability detection. The developers who embrace these tools today will be the leaders of tomorrow's tech landscape.'''
        },
        {
            'title': 'Building Scalable React Applications: Best Practices',
            'content': '''Scaling React applications is one of the biggest challenges developers face as their projects grow. What starts as a simple component-based architecture can quickly become unwieldy without proper planning and structure.

The key to scalable React development lies in several fundamental principles. First, component composition over inheritance allows for more flexible and reusable code. By breaking down complex UI elements into smaller, focused components, we create a more maintainable codebase.

State management becomes critical as applications grow. While React's built-in state is perfect for simple scenarios, larger applications benefit from solutions like Redux, Zustand, or React Query for server state management. Each has its place depending on your specific needs.

Performance optimization is another crucial aspect. Techniques like code splitting, lazy loading, and memoization can dramatically improve user experience. React's built-in tools like React.memo and useMemo are your first line of defense against unnecessary re-renders.

Finally, establishing clear patterns for folder structure, naming conventions, and component organization from the beginning saves countless hours of refactoring later. A well-structured React application is not just easier to develop but also easier for new team members to understand and contribute to.'''
        },
        {
            'title': 'Cybersecurity in 2024: What Every Developer Should Know',
            'content': '''The cybersecurity landscape is evolving rapidly, and developers are on the front lines of digital defense. With cyber attacks becoming more sophisticated, understanding security principles is no longer optional—it's essential.

Zero-trust architecture is becoming the new standard. This approach assumes that no user or device should be trusted by default, even if they're inside the network perimeter. For developers, this means implementing robust authentication and authorization at every level of the application.

API security deserves special attention. With the rise of microservices and third-party integrations, APIs have become prime targets for attackers. Implementing proper rate limiting, input validation, and OAuth 2.0 flows can prevent many common attack vectors.

Data encryption isn't just about HTTPS anymore. End-to-end encryption, database encryption at rest, and secure key management are becoming standard requirements. Understanding cryptographic principles helps developers make informed decisions about protecting sensitive data.

The human element remains the weakest link in cybersecurity. Developers must consider social engineering attacks when designing user interfaces and authentication flows. Multi-factor authentication and security awareness training are crucial components of a comprehensive security strategy.'''
        }
    ],
    'Health & Wellness': [
        {
            'title': 'The Science Behind Mindful Eating',
            'content': '''Mindful eating is more than just a wellness trend—it's a scientifically-backed approach to nutrition that can transform your relationship with food. Research shows that when we eat mindfully, we not only enjoy our meals more but also improve digestion and maintain healthier weight levels.

The practice involves paying full attention to the eating experience, from the colors and textures of food to the sensations of hunger and fullness. This heightened awareness helps us recognize our body's natural cues, leading to better portion control and food choices.

Studies from Harvard Medical School demonstrate that mindful eating can reduce stress-related eating and emotional food cravings. When we slow down and focus on our meals, the parasympathetic nervous system activates, improving digestion and nutrient absorption.

One of the most powerful aspects of mindful eating is its impact on satiety. It takes about 20 minutes for our brain to register fullness, but most people finish their meals in 10-15 minutes. By eating slowly and mindfully, we give our body time to signal when we've had enough.

Practical techniques include putting down utensils between bites, chewing thoroughly, and eliminating distractions like phones or TV during meals. These simple changes can lead to profound improvements in both physical health and mental well-being.'''
        },
        {
            'title': 'Building Mental Resilience in a Digital Age',
            'content': '''Our constant connection to digital devices is creating unprecedented challenges for mental health. While technology offers incredible benefits, it also contributes to anxiety, depression, and attention disorders. Building mental resilience has never been more important.

Digital overwhelm is real. The average person checks their phone 96 times per day and receives over 60 notifications. This constant stimulation keeps our nervous system in a heightened state, making it difficult to relax and focus on what truly matters.

Creating boundaries with technology is essential for mental health. This doesn't mean abandoning digital tools entirely, but rather using them intentionally. Techniques like digital detoxes, notification management, and designated phone-free times can significantly improve mental well-being.

Mindfulness practices are particularly effective in our digital age. Regular meditation, even just 10 minutes daily, can improve focus, reduce anxiety, and increase emotional regulation. Apps like Headspace and Calm make these practices accessible, though in-person meditation groups offer additional social benefits.

Physical exercise remains one of the most powerful tools for mental health. Regular movement releases endorphins, improves sleep quality, and provides a natural break from digital stimulation. The key is finding activities you enjoy, whether it's dancing, hiking, or playing sports.

Building strong social connections offline is crucial. While social media can help us stay connected, face-to-face interactions provide deeper emotional support and reduce feelings of isolation and loneliness.'''
        }
    ],
    'Travel': [
        {
            'title': 'Solo Travel: A Journey to Self-Discovery',
            'content': '''Solo travel is one of the most transformative experiences you can have. It pushes you out of your comfort zone, builds confidence, and offers unparalleled opportunities for self-reflection and personal growth.

The freedom of solo travel is unmatched. You set your own pace, choose your own adventures, and follow your curiosity wherever it leads. There's no need to compromise on destinations, activities, or timing. This autonomy often leads to more authentic and meaningful travel experiences.

Safety concerns are valid but manageable with proper preparation. Research your destination thoroughly, share your itinerary with trusted contacts, and trust your instincts. Many solo travelers find that locals are more likely to approach and help someone traveling alone, leading to genuine cultural exchanges.

Solo travel builds practical life skills. Navigating foreign transportation systems, communicating across language barriers, and problem-solving in unfamiliar environments all contribute to increased self-reliance and adaptability.

The introspective aspect of solo travel is perhaps its greatest benefit. Without the distractions of companions, you're more likely to engage with your surroundings and reflect on your experiences. Many solo travelers report gaining clarity on life goals and priorities during their journeys.

Starting with shorter trips or destinations with good infrastructure can help build confidence for more adventurous solo adventures. The key is taking that first step—the rewards of solo travel far outweigh the initial nervousness.'''
        },
        {
            'title': 'Sustainable Tourism: Traveling Responsibly in 2024',
            'content': '''The tourism industry is at a crossroads. As travel becomes more accessible, the environmental and social impacts of tourism are becoming impossible to ignore. Sustainable travel isn't just a trend—it's a necessity for preserving the destinations we love.

Climate change is the most pressing issue facing the travel industry. Aviation accounts for about 2.5% of global CO2 emissions, and this figure is growing rapidly. Conscious travelers are choosing overland transportation when possible, selecting direct flights, and offsetting their carbon footprint through verified programs.

Overtourism is destroying many beloved destinations. Venice, Barcelona, and Machu Picchu are just a few examples of places struggling with too many visitors. Responsible travelers are choosing off-season travel, visiting lesser-known destinations, and respecting local capacity limits.

Supporting local economies is a cornerstone of sustainable tourism. This means choosing locally-owned accommodations, eating at family-run restaurants, and buying souvenirs made by local artisans. These choices ensure that tourism dollars benefit the communities you visit rather than large international corporations.

Cultural sensitivity is equally important. Learning basic phrases in the local language, understanding cultural norms, and showing respect for local customs enriches the travel experience for everyone involved. It's about being a guest rather than a consumer.

The future of travel lies in quality over quantity. Instead of rushing through multiple destinations, sustainable travelers are choosing to stay longer in fewer places, forming deeper connections with local communities and reducing their environmental impact.'''
        }
    ],
    'Food & Cooking': [
        {
            'title': 'The Art of Fermentation: Ancient Wisdom for Modern Health',
            'content': '''Fermentation is humanity's oldest form of food preservation, and it's experiencing a remarkable renaissance. From kimchi to kombucha, fermented foods are not only delicious but also incredibly beneficial for our health and the environment.

The science behind fermentation is fascinating. Beneficial bacteria and yeasts break down sugars and starches, creating probiotics, enzymes, and unique flavors that can't be achieved through any other cooking method. This process also increases the bioavailability of nutrients, making them easier for our bodies to absorb.

Gut health is at the center of the fermentation revival. Our microbiome—the trillions of bacteria living in our digestive system—plays a crucial role in immunity, mental health, and overall well-being. Fermented foods provide the diverse bacterial strains our gut needs to function optimally.

Starting your fermentation journey is easier than you might think. Simple projects like sauerkraut require only cabbage, salt, and time. As you gain confidence, you can explore more complex ferments like miso, tempeh, or even your own sourdough starter.

The environmental benefits of fermentation are significant. The process requires no electricity, produces no waste, and can transform simple vegetables into nutrient-dense foods with extended shelf life. It's a perfect example of working with natural processes rather than against them.

Traditional fermentation techniques vary dramatically across cultures, each adapted to local ingredients and climate conditions. Exploring these traditions connects us to our culinary heritage while providing endless inspiration for modern kitchens.'''
        }
    ],
    'Personal Growth': [
        {
            'title': 'The Power of Morning Routines: Starting Your Day with Intention',
            'content': '''How you start your morning sets the tone for your entire day. A well-designed morning routine can increase productivity, reduce stress, and create a sense of accomplishment before the day's challenges begin.

The science of circadian rhythms supports the importance of consistent morning habits. Our bodies naturally produce cortisol in the early morning hours, providing energy and alertness. Aligning our activities with these natural rhythms optimizes both physical and mental performance.

Successful morning routines share common elements: they're consistent, personally meaningful, and focused on self-care rather than external demands. This might include meditation, exercise, journaling, or simply enjoying a quiet cup of coffee without distractions.

The key is starting small and building gradually. Attempting to overhaul your entire morning routine overnight often leads to failure and frustration. Instead, choose one small habit and practice it consistently for several weeks before adding another element.

Technology can either support or sabotage your morning routine. Many successful people avoid checking their phones for the first hour after waking, protecting their mental space from external demands and distractions. This simple change can dramatically improve focus and mood throughout the day.

Remember that the perfect morning routine is highly individual. What works for others might not work for you, and that's perfectly fine. The goal is to create a routine that energizes and centers you for the day ahead, whatever that looks like in your unique circumstances.'''
        },
        {
            'title': 'Embracing Failure: The Hidden Path to Success',
            'content': '''Failure is perhaps the most misunderstood aspect of personal growth. While society often treats failure as something to avoid, research shows that embracing failure is essential for learning, innovation, and long-term success.

The fear of failure paralyzes more dreams than actual failure ever could. This fear keeps us in our comfort zones, preventing the risk-taking necessary for significant achievement. Reframing failure as feedback rather than defeat transforms it from an enemy into a teacher.

Neuroscience reveals that our brains learn more from mistakes than from successes. When we fail, neural pathways strengthen, creating lasting memories that help us avoid similar mistakes in the future. This biological reality makes failure an essential component of the learning process.

Silicon Valley has popularized the concept of "failing fast," but this philosophy extends far beyond entrepreneurship. In any field, rapid experimentation and iteration—including inevitable failures—lead to breakthrough innovations and personal growth.

Resilience isn't about avoiding failure; it's about recovering from it quickly and effectively. This involves developing emotional regulation skills, maintaining perspective, and having a support system that encourages risk-taking and learning from setbacks.

The most successful people in any field have failed more than average people have even tried. This isn't coincidence—it's causation. Each failure provides valuable data, builds resilience, and brings them closer to their eventual success.'''
        }
    ]
}

def create_categories():
    """Create categories if they don't exist"""
    categories = [
        {'name': 'Technology', 'slug': 'technology', 'color': '#3B82F6'},
        {'name': 'Health & Wellness', 'slug': 'health-wellness', 'color': '#10B981'},
        {'name': 'Travel', 'slug': 'travel', 'color': '#F59E0B'},
        {'name': 'Food & Cooking', 'slug': 'food-cooking', 'color': '#EF4444'},
        {'name': 'Personal Growth', 'slug': 'personal-growth', 'color': '#8B5CF6'},
        {'name': 'Business', 'slug': 'business', 'color': '#6B7280'},
        {'name': 'Art & Design', 'slug': 'art-design', 'color': '#EC4899'},
        {'name': 'Science', 'slug': 'science', 'color': '#06B6D4'},
    ]
    
    created_categories = []
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        created_categories.append(category)
        if created:
            print(f"Created category: {category.name}")
    
    return created_categories

def create_users():
    """Create demo users"""
    created_users = []
    
    for user_data in DEMO_USERS:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'password': make_password('demo123'),  # Easy password for all demo users
            }
        )
        created_users.append(user)
        if created:
            print(f"Created user: {user.username}")
    
    return created_users

def create_posts(users, categories):
    """Create realistic posts"""
    created_posts = []
    
    for category in categories:
        if category.name in POST_CONTENT:
            posts_data = POST_CONTENT[category.name]
            
            for post_data in posts_data:
                # Randomly assign to users
                author = random.choice(users)
                
                # Create post with realistic timestamps
                days_ago = random.randint(1, 30)
                created_time = timezone.now() - timedelta(days=days_ago)
                
                post = Post.objects.create(
                    author=author,
                    title=post_data['title'],
                    content=post_data['content'],
                    excerpt=post_data['content'][:200] + '...',
                    category=category,
                    created_at=created_time,
                    updated_at=created_time
                )
                
                created_posts.append(post)
                print(f"Created post: {post.title}")
    
    return created_posts

def create_engagement(users, posts):
    """Create realistic engagement (likes, comments, views)"""
    
    # Create likes
    for post in posts:
        # Random number of likes (0-15)
        num_likes = random.randint(0, 15)
        likers = random.sample(users, min(num_likes, len(users)))
        
        for user in likers:
            if user != post.author:  # Don't like your own posts
                post.likes.add(user)
    
    # Create comments
    comment_texts = [
        "Great insights! Thanks for sharing.",
        "This really resonates with me. I've had similar experiences.",
        "Excellent points. I'd love to hear more about this topic.",
        "Thanks for the detailed explanation. Very helpful!",
        "Interesting perspective. I hadn't thought about it this way.",
        "This is exactly what I needed to read today.",
        "Well written and informative. Keep up the great work!",
        "I disagree with some points, but appreciate the thoughtful analysis.",
        "Can you recommend any resources for learning more about this?",
        "Your writing style is very engaging. Looking forward to more posts!"
    ]
    
    for post in posts:
        # Random number of comments (0-8)
        num_comments = random.randint(0, 8)
        
        for _ in range(num_comments):
            commenter = random.choice(users)
            if commenter != post.author:  # Don't comment on your own posts immediately
                days_after_post = random.randint(0, 5)
                comment_time = post.created_at + timedelta(days=days_after_post)
                
                Comment.objects.create(
                    post=post,
                    author=commenter,
                    content=random.choice(comment_texts),
                    created_at=comment_time
                )
    
    # Create views
    for post in posts:
        # Random number of views (10-200)
        num_views = random.randint(10, 200)
        
        for _ in range(num_views):
            viewer = random.choice(users + [None])  # Some anonymous views
            
            # Views happen after post creation
            days_after_post = random.randint(0, 10)
            hours_after = random.randint(0, 23)
            view_time = post.created_at + timedelta(days=days_after_post, hours=hours_after)
            
            PostView.objects.create(
                post=post,
                user=viewer,
                ip_address=f"192.168.1.{random.randint(1, 254)}" if not viewer else None,
                viewed_at=view_time
            )

def create_follows(users):
    """Create realistic follow relationships"""
    for user in users:
        # Each user follows 3-8 other users
        num_follows = random.randint(3, 8)
        potential_follows = [u for u in users if u != user]
        follows = random.sample(potential_follows, min(num_follows, len(potential_follows)))
        
        for followed_user in follows:
            Follow.objects.get_or_create(
                follower=user,
                following=followed_user
            )

def main():
    """Main function to create all demo data"""
    print("Creating demo data for Wrytera...")
    
    # Create categories
    print("\n1. Creating categories...")
    categories = create_categories()
    
    # Create users
    print("\n2. Creating users...")
    users = create_users()
    
    # Create posts
    print("\n3. Creating posts...")
    posts = create_posts(users, categories)
    
    # Create engagement
    print("\n4. Creating engagement (likes, comments, views)...")
    create_engagement(users, posts)
    
    # Create follows
    print("\n5. Creating follow relationships...")
    create_follows(users)
    
    print(f"\n✅ Demo data created successfully!")
    print(f"Users: {len(users)}")
    print(f"Categories: {len(categories)}")
    print(f"Posts: {len(posts)}")
    print(f"Comments: {Comment.objects.count()}")
    print(f"Follows: {Follow.objects.count()}")
    print(f"Post Views: {PostView.objects.count()}")
    
    print("\n📝 Demo user credentials:")
    print("Username: any of the created usernames (alex, sarah, mike, etc.)")
    print("Password: demo123")

if __name__ == '__main__':
    main()
