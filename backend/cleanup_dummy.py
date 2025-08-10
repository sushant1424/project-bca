import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from posts.models import Post, Category

print("🧹 Cleaning up dummy data...")

# Delete all posts first
posts_deleted = Post.objects.all().delete()
print(f"✅ Deleted {posts_deleted[0]} posts")

# Delete all categories
categories_deleted = Category.objects.all().delete()
print(f"✅ Deleted {categories_deleted[0]} categories")

print("🎉 Cleanup complete! Database is now clean and ready for your real content.")
