from django.db import models
from django.conf import settings
from django.utils import timezone

class Category(models.Model):
    """Category model for post categorization"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color code
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        db_table = 'categories'
    
    def __str__(self):
        return self.name

class Post(models.Model):
    """Post model for user-created content"""
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)  # Short preview
    image = models.URLField(blank=True, null=True)  # Optional featured image
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    views = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'posts'
    
    def __str__(self):
        return f"{self.title} by {self.author.username}"
    
    def like_count(self):
        return self.likes.count()
    
    def comment_count(self):
        return self.comments.count()

class Comment(models.Model):
    """Comment model for post interactions"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_comments', blank=True)
    
    class Meta:
        ordering = ['created_at']
        db_table = 'comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"
    
    def like_count(self):
        return self.likes.count()

class Follow(models.Model):
    """Follow model for user relationships"""
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['follower', 'following']
        db_table = 'follows'
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class Repost(models.Model):
    """Repost model for sharing posts"""
    original_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reposts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reposts')
    comment = models.TextField(blank=True)  # Optional comment when reposting
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['original_post', 'user']
        db_table = 'reposts'
    
    def __str__(self):
        return f"{self.user.username} reposted {self.original_post.title}"

class SavedPost(models.Model):
    """SavedPost model for user's saved posts library"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_posts')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'user']
        db_table = 'saved_posts'
        ordering = ['-saved_at']
    
    def __str__(self):
        return f"{self.user.username} saved {self.post.title}"