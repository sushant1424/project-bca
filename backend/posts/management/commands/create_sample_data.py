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

        self.stdout.write(f'Creating {num_users} users with {posts_per_user} posts each...')

        # Create categories
        categories = ['Technology', 'Science', 'Art', 'Music', 'Sports', 'Travel']
        for cat_name in categories:
            Category.objects.get_or_create(name=cat_name)

        # Create users
        users = []
        for i in range(num_users):
            username = f'user_{i+1}'
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password='testpass123',
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    bio=fake.text(max_nb_chars=200)
                )
                users.append(user)

        # Create posts
        all_categories = list(Category.objects.all())
        for user in users:
            for j in range(posts_per_user):
                Post.objects.create(
                    title=fake.sentence(nb_words=6),
                    content=fake.text(max_nb_chars=1000),
                    author=user,
                    category=random.choice(all_categories),
                    is_published=random.choice([True, False])
                )

        # Create some follows
        for user in users:
            other_users = [u for u in users if u != user]
            follows = random.sample(other_users, min(3, len(other_users)))
            for follow_user in follows:
                Follow.objects.get_or_create(follower=user, following=follow_user)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(users)} users and {len(users) * posts_per_user} posts'
            )
        )
