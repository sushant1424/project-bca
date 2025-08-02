from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post, Follow, Category
from faker import Faker
import random

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Create sample posts and users for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=5,
            help='Number of users to create'
        )
        parser.add_argument(
            '--posts',
            type=int,
            default=10,
            help='Number of posts to create per user'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        posts_per_user = options['posts']

        self.stdout.write('Creating sample data...')

        # Create categories
        categories_data = [
            {'name': 'Technology', 'slug': 'technology', 'color': '#3B82F6'},
            {'name': 'Culture', 'slug': 'culture', 'color': '#8B5CF6'},
            {'name': 'Business', 'slug': 'business', 'color': '#10B981'},
            {'name': 'Politics', 'slug': 'politics', 'color': '#EF4444'},
            {'name': 'Finance', 'slug': 'finance', 'color': '#F59E0B'},
            {'name': 'Food & Drink', 'slug': 'food-drink', 'color': '#EC4899'},
            {'name': 'Sports', 'slug': 'sports', 'color': '#06B6D4'},
            {'name': 'Art & Design', 'slug': 'art-design', 'color': '#84CC16'},
            {'name': 'Health', 'slug': 'health', 'color': '#F97316'},
            {'name': 'Science', 'slug': 'science', 'color': '#6366F1'},
            {'name': 'Education', 'slug': 'education', 'color': '#14B8A6'},
            {'name': 'Travel', 'slug': 'travel', 'color': '#F43F5E'},
            {'name': 'Fashion', 'slug': 'fashion', 'color': '#A855F7'},
            {'name': 'Entertainment', 'slug': 'entertainment', 'color': '#EAB308'},
            {'name': 'Environment', 'slug': 'environment', 'color': '#22C55E'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'color': cat_data['color'],
                    'description': f'Posts about {cat_data["name"].lower()}'
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create users
        users = []
        for i in range(num_users):
            username = fake.unique.user_name()
            email = fake.unique.email()
            user = User.objects.create_user(
                username=username,
                email=email,
                password='testpass123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                bio=fake.text(max_nb_chars=200)
            )
            users.append(user)
            self.stdout.write(f'Created user: {username}')

        # Create posts
        for user in users:
            for i in range(posts_per_user):
                title = fake.sentence(nb_words=6)
                content = fake.paragraphs(nb=3)
                excerpt = fake.text(max_nb_chars=200)
                
                post = Post.objects.create(
                    author=user,
                    title=title,
                    content='\n\n'.join(content),
                    excerpt=excerpt,
                    image=fake.image_url() if random.choice([True, False]) else '',
                    category=random.choice(categories) if random.choice([True, False]) else None
                )
                
                # Add some random likes
                for _ in range(random.randint(0, 3)):
                    random_user = random.choice(users)
                    if random_user != user:
                        post.likes.add(random_user)

        # Create some follow relationships
        for user in users:
            for _ in range(random.randint(1, 3)):
                random_user = random.choice(users)
                if random_user != user:
                    Follow.objects.get_or_create(
                        follower=user,
                        following=random_user
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {num_users} users and {num_users * posts_per_user} posts!'
            )
        ) 